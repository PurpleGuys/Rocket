import { users, services, timeSlots, orders, sessions, type User, type InsertUser, type UpdateUser, type Service, type InsertService, type TimeSlot, type InsertTimeSlot, type Order, type InsertOrder, type Session } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  updateUserSecurity(id: number, security: {
    loginAttempts?: number;
    lockUntil?: Date | null;
    lastLogin?: Date;
    verificationToken?: string | null | undefined;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified?: boolean;
  }): Promise<void>;
  updateUserPassword(id: number, hashedPassword: string): Promise<void>;
  deleteUser(id: number): Promise<void>;
  
  // Sessions
  createSession(session: {
    userId: number;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  deleteSessionByToken(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  getUserSessions(userId: number): Promise<Session[]>;
  
  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  
  // Time slots
  getAvailableTimeSlots(date: string): Promise<TimeSlot[]>;
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlotBookings(id: number, increment: number): Promise<void>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrders(limit?: number): Promise<Order[]>;
  getUserOrders(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;
  updateOrderPayment(id: number, paymentIntentId: string, status: string): Promise<void>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    todayOrders: number;
    monthlyRevenue: string;
    rentedDumpsters: number;
    activeCustomers: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, user: UpdateUser): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...user,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async updateUserSecurity(id: number, security: {
    loginAttempts?: number;
    lockUntil?: Date | null;
    lastLogin?: Date;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isVerified?: boolean;
  }): Promise<void> {
    await db
      .update(users)
      .set({
        ...security,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Sessions
  async createSession(session: {
    userId: number;
    token: string;
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [newSession] = await db
      .insert(sessions)
      .values({
        id: sessionId,
        ...session,
      })
      .returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
    return session || undefined;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async deleteSessionByToken(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.userId, userId));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values(service)
      .returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService || undefined;
  }

  // Time slots
  async getAvailableTimeSlots(date: string): Promise<TimeSlot[]> {
    return await db
      .select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.date, date),
          eq(timeSlots.isAvailable, true),
          sql`${timeSlots.currentBookings} < ${timeSlots.maxBookings}`
        )
      );
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    const [timeSlot] = await db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return timeSlot || undefined;
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [newTimeSlot] = await db
      .insert(timeSlots)
      .values(timeSlot)
      .returning();
    return newTimeSlot;
  }

  async updateTimeSlotBookings(id: number, increment: number): Promise<void> {
    await db
      .update(timeSlots)
      .set({
        currentBookings: sql`${timeSlots.currentBookings} + ${increment}`
      })
      .where(eq(timeSlots.id, id));
  }

  // Orders
  async createOrder(order: InsertOrder): Promise<Order> {
    // Generate order number
    const orderNumber = `BNE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        orderNumber,
      })
      .returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getOrders(limit: number = 50): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(orders.id, id));
  }

  async updateOrderPayment(id: number, paymentIntentId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({
        stripePaymentIntentId: paymentIntentId,
        paymentStatus: status,
        status: status === 'paid' ? 'confirmed' : 'pending',
        updatedAt: new Date()
      })
      .where(eq(orders.id, id));
  }

  async getDashboardStats(): Promise<{
    todayOrders: number;
    monthlyRevenue: string;
    rentedDumpsters: number;
    activeCustomers: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Today's orders
    const [todayOrdersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(sql`date(${orders.createdAt}) = ${today}`);

    // Monthly revenue
    const [monthlyRevenueResult] = await db
      .select({ total: sql<string>`cast(sum(${orders.totalTTC}) as text)` })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, new Date(startOfMonth)),
          eq(orders.paymentStatus, 'paid')
        )
      );

    // Rented dumpsters (active orders)
    const [rentedDumpstersResult] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(eq(orders.status, 'delivered'));

    // Active customers (users with orders)
    const [activeCustomersResult] = await db
      .select({ count: sql<number>`cast(count(distinct ${orders.userId}) as integer)` })
      .from(orders)
      .where(gte(orders.createdAt, new Date(startOfMonth)));

    return {
      todayOrders: todayOrdersResult?.count || 0,
      monthlyRevenue: monthlyRevenueResult?.total || "0",
      rentedDumpsters: rentedDumpstersResult?.count || 0,
      activeCustomers: activeCustomersResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
