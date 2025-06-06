// Temporary mock storage for demonstration until database is restored
import { type User, type Order, type SatisfactionSurvey } from '@shared/schema';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@remondis.fr',
    password: '$2a$10$example',
    firstName: 'Admin',
    lastName: 'Remondis',
    phone: '+33123456789',
    role: 'admin',
    isVerified: true,
    verificationToken: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    address: null,
    company: null,
    siret: null,
    isActive: true,
    failedLoginAttempts: 0,
    lastLoginAttempt: null,
    accountLockedUntil: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    emailVerificationExpires: null,
    lastPasswordChange: null,
    notifyOnInactivity: true,
    lastInactivityNotification: null
  }
];

const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'REM-2024-001',
    userId: 1,
    serviceId: 1,
    deliveryTimeSlotId: null,
    pickupTimeSlotId: null,
    customerFirstName: 'Jean',
    customerLastName: 'Dupont',
    customerEmail: 'jean.dupont@example.com',
    customerPhone: '+33123456789',
    customerAddress: '123 Rue de la Paix, 75001 Paris',
    wasteTypes: ['Déchets verts', 'Gravats'],
    status: 'delivered',
    basePrice: '350.00',
    transportPrice: '45.00',
    treatmentPrice: '80.00',
    totalPrice: '475.00',
    durationDays: 7,
    deliveryDate: null,
    pickupDate: null,
    specialInstructions: null,
    adminNotes: null,
    isActive: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    updatedAt: new Date()
  },
  {
    id: 2,
    orderNumber: 'REM-2024-002',
    userId: 1,
    serviceId: 1,
    deliveryTimeSlotId: null,
    pickupTimeSlotId: null,
    customerFirstName: 'Marie',
    customerLastName: 'Martin',
    customerEmail: 'marie.martin@example.com',
    customerPhone: '+33123456780',
    customerAddress: '456 Avenue des Champs, 75008 Paris',
    wasteTypes: ['Déchets industriels'],
    status: 'delivered',
    basePrice: '280.00',
    transportPrice: '35.00',
    treatmentPrice: '60.00',
    totalPrice: '375.00',
    durationDays: 5,
    deliveryDate: null,
    pickupDate: null,
    specialInstructions: null,
    adminNotes: null,
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date()
  }
];

const mockSurveys: SatisfactionSurvey[] = [
  {
    id: 1,
    orderId: 1,
    userId: 1,
    token: 'survey-token-123',
    emailSent: true,
    emailSentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    completed: true,
    completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    overallSatisfaction: 4,
    serviceQuality: 5,
    deliveryTiming: 4,
    pickupTiming: 4,
    customerService: 5,
    valueForMoney: 3,
    npsScore: 8,
    wouldRecommend: true,
    wouldUseAgain: true,
    positiveComments: 'Service excellent, équipe très professionnelle',
    negativeComments: 'Prix un peu élevé',
    suggestions: 'Proposer des tarifs dégressifs pour les gros volumes',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    id: 2,
    orderId: 2,
    userId: 1,
    token: 'survey-token-456',
    emailSent: true,
    emailSentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    completed: false,
    completedAt: null,
    expiresAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    overallSatisfaction: null,
    serviceQuality: null,
    deliveryTiming: null,
    pickupTiming: null,
    customerService: null,
    valueForMoney: null,
    npsScore: null,
    wouldRecommend: null,
    wouldUseAgain: null,
    positiveComments: null,
    negativeComments: null,
    suggestions: null,
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

export class MockStorage {
  // Mock user authentication
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = mockUsers.find(u => u.email === email);
    // Simple mock authentication - in demo mode accept any password
    return user || null;
  }

  async getUserById(id: number): Promise<User | null> {
    return mockUsers.find(u => u.id === id) || null;
  }

  // Mock satisfaction survey methods
  async getAllSatisfactionSurveys(): Promise<any[]> {
    return mockSurveys.map(survey => ({
      ...survey,
      customerName: mockOrders.find(o => o.id === survey.orderId)?.customerFirstName + ' ' + 
                    mockOrders.find(o => o.id === survey.orderId)?.customerLastName,
      customerEmail: mockOrders.find(o => o.id === survey.orderId)?.customerEmail
    }));
  }

  async getSatisfactionSurveyStats(): Promise<any> {
    const completedSurveys = mockSurveys.filter(s => s.completed);
    const totalSurveys = mockSurveys.length;
    
    return {
      totalSurveys,
      completionRate: totalSurveys > 0 ? Math.round((completedSurveys.length / totalSurveys) * 100) : 0,
      averageOverallSatisfaction: completedSurveys.length > 0 ? 
        completedSurveys.reduce((sum, s) => sum + (s.overallSatisfaction || 0), 0) / completedSurveys.length : 0,
      averageNPS: completedSurveys.length > 0 ? 
        completedSurveys.reduce((sum, s) => sum + (s.npsScore || 0), 0) / completedSurveys.length : 0
    };
  }

  async getSatisfactionSurveyByToken(token: string): Promise<any | null> {
    const survey = mockSurveys.find(s => s.token === token);
    if (!survey) return null;

    const order = mockOrders.find(o => o.id === survey.orderId);
    return {
      ...survey,
      order
    };
  }

  async updateSatisfactionSurvey(id: number, data: any): Promise<void> {
    const index = mockSurveys.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSurveys[index] = { ...mockSurveys[index], ...data };
    }
  }

  // Mock other required methods
  async getOrder(id: number): Promise<Order | null> {
    return mockOrders.find(o => o.id === id) || null;
  }

  async getServices(): Promise<any[]> {
    return [
      {
        id: 1,
        name: 'Benne 22m³',
        volume: 22,
        basePrice: '350.00',
        description: 'Benne de grande capacité pour déchets volumineux',
        imageUrl: '/api/placeholder/400/300'
      }
    ];
  }

  async getWasteTypes(): Promise<any[]> {
    return [
      { id: 1, name: 'Déchets verts', description: 'Végétaux et déchets de jardin' },
      { id: 2, name: 'Gravats', description: 'Déchets de construction' },
      { id: 3, name: 'Déchets industriels', description: 'Déchets d\'activité industrielle' }
    ];
  }

  async getTreatmentPricing(): Promise<any[]> {
    return [
      { id: 1, wasteTypeId: 1, pricePerTon: '45.00', treatmentType: 'Compostage' },
      { id: 2, wasteTypeId: 2, pricePerTon: '65.00', treatmentType: 'Recyclage' },
      { id: 3, wasteTypeId: 3, pricePerTon: '85.00', treatmentType: 'Traitement spécialisé' }
    ];
  }
}

export const mockStorage = new MockStorage();