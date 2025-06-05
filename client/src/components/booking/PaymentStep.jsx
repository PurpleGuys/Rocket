var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBookingState } from "@/hooks/useBookingState";
import { stripePromise } from "@/lib/stripe";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, Shield } from "lucide-react";
function CheckoutForm() {
    var _this = this;
    var stripe = useStripe();
    var elements = useElements();
    var toast = useToast().toast;
    var _a = useBookingState(), bookingData = _a.bookingData, updateCustomer = _a.updateCustomer, setCurrentStep = _a.setCurrentStep, calculateTotalPrice = _a.calculateTotalPrice;
    var _b = useState(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var _c = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        createAccount: false,
        acceptTerms: false,
        acceptMarketing: false,
    }), customerInfo = _c[0], setCustomerInfo = _c[1];
    var pricing = calculateTotalPrice();
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var orderData, orderResponse, order, error, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    if (!stripe || !elements) {
                        return [2 /*return*/];
                    }
                    if (!customerInfo.acceptTerms) {
                        toast({
                            title: "Conditions requises",
                            description: "Vous devez accepter les conditions générales pour continuer.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    setIsProcessing(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, 6, 7]);
                    orderData = {
                        serviceId: bookingData.service.id,
                        deliveryTimeSlotId: (_a = bookingData.deliveryTimeSlot) === null || _a === void 0 ? void 0 : _a.id,
                        pickupTimeSlotId: (_b = bookingData.pickupTimeSlot) === null || _b === void 0 ? void 0 : _b.id,
                        customerFirstName: customerInfo.firstName,
                        customerLastName: customerInfo.lastName,
                        customerEmail: customerInfo.email,
                        customerPhone: customerInfo.phone,
                        deliveryStreet: bookingData.address.street,
                        deliveryCity: bookingData.address.city,
                        deliveryPostalCode: bookingData.address.postalCode,
                        deliveryCountry: bookingData.address.country,
                        deliveryNotes: bookingData.address.deliveryNotes,
                        durationDays: bookingData.durationDays,
                        wasteTypes: bookingData.wasteTypes,
                        status: "pending",
                        paymentStatus: "pending",
                    };
                    return [4 /*yield*/, apiRequest("POST", "/api/orders", orderData)];
                case 2:
                    orderResponse = _c.sent();
                    return [4 /*yield*/, orderResponse.json()];
                case 3:
                    order = _c.sent();
                    // Update customer in booking state
                    updateCustomer({
                        firstName: customerInfo.firstName,
                        lastName: customerInfo.lastName,
                        email: customerInfo.email,
                        phone: customerInfo.phone,
                        createAccount: customerInfo.createAccount,
                    });
                    return [4 /*yield*/, stripe.confirmPayment({
                            elements: elements,
                            confirmParams: {
                                return_url: "".concat(window.location.origin, "?order_id=").concat(order.id),
                            },
                            redirect: 'if_required',
                        })];
                case 4:
                    error = (_c.sent()).error;
                    if (error) {
                        toast({
                            title: "Erreur de paiement",
                            description: error.message,
                            variant: "destructive",
                        });
                    }
                    else {
                        // Payment successful, move to confirmation
                        toast({
                            title: "Paiement réussi",
                            description: "Votre commande a été confirmée avec succès!",
                        });
                        setCurrentStep(5);
                    }
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _c.sent();
                    toast({
                        title: "Erreur",
                        description: error_1.message || "Une erreur est survenue lors du traitement de votre commande.",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 7];
                case 6:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    return (<form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2"/>
            Vos informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first-name">Prénom *</Label>
              <Input id="first-name" required value={customerInfo.firstName} onChange={function (e) { return setCustomerInfo(function (prev) { return (__assign(__assign({}, prev), { firstName: e.target.value })); }); }}/>
            </div>
            <div>
              <Label htmlFor="last-name">Nom *</Label>
              <Input id="last-name" required value={customerInfo.lastName} onChange={function (e) { return setCustomerInfo(function (prev) { return (__assign(__assign({}, prev), { lastName: e.target.value })); }); }}/>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" required value={customerInfo.email} onChange={function (e) { return setCustomerInfo(function (prev) { return (__assign(__assign({}, prev), { email: e.target.value })); }); }}/>
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input id="phone" type="tel" required value={customerInfo.phone} onChange={function (e) { return setCustomerInfo(function (prev) { return (__assign(__assign({}, prev), { phone: e.target.value })); }); }}/>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="create-account" checked={customerInfo.createAccount} onCheckedChange={function (checked) {
            return setCustomerInfo(function (prev) { return (__assign(__assign({}, prev), { createAccount: checked })); });
        }}/>
            <Label htmlFor="create-account" className="text-sm">
              Créer un compte pour suivre mes commandes
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Mode de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup defaultValue="stripe">
            <div className="flex items-center space-x-2 p-4 border-2 border-primary-500 bg-primary-50 rounded-lg">
              <RadioGroupItem value="stripe" id="stripe"/>
              <Label htmlFor="stripe" className="flex items-center flex-1">
                <CreditCard className="h-5 w-5 mr-3 text-primary-600"/>
                <div>
                  <div className="font-medium">Carte bancaire</div>
                  <div className="text-sm text-slate-600">Paiement sécurisé via Stripe</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          {/* Stripe Payment Element */}
          <div className="mt-4">
            <PaymentElement />
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Conditions générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox id="accept-terms" required checked={customerInfo.acceptTerms} onCheckedChange={function (checked) {
            return setCustomerInfo(function (prev) { return (__assign(__assign({}, prev), { acceptTerms: checked })); });
        }}/>
            <Label htmlFor="accept-terms" className="text-sm leading-relaxed">
              J'accepte les{' '}
              <a href="#" className="text-primary-600 hover:underline">conditions générales de vente</a>{' '}
              et la{' '}
              <a href="#" className="text-primary-600 hover:underline">politique de confidentialité</a> *
            </Label>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="accept-marketing" checked={customerInfo.acceptMarketing} onCheckedChange={function (checked) {
            return setCustomerInfo(function (prev) { return (__assign(__assign({}, prev), { acceptMarketing: checked })); });
        }}/>
            <Label htmlFor="accept-marketing" className="text-sm">
              J'accepte de recevoir des offres commerciales par email
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-lg py-4 h-auto" disabled={!stripe || isProcessing}>
        {isProcessing ? (<>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"/>
            Traitement...
          </>) : (<>
            <Lock className="h-5 w-5 mr-2"/>
            Payer {pricing.totalTTC.toFixed(2)}€
          </>)}
      </Button>

      <div className="text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center">
          <Shield className="h-4 w-4 mr-1"/>
          Paiement sécurisé SSL 256-bit
        </p>
      </div>
    </form>);
}
export default function PaymentStep() {
    var _a = useBookingState(), bookingData = _a.bookingData, calculateTotalPrice = _a.calculateTotalPrice;
    var _b = useState(""), clientSecret = _b[0], setClientSecret = _b[1];
    var pricing = calculateTotalPrice();
    useEffect(function () {
        if (bookingData.service) {
            // Create payment intent
            apiRequest("POST", "/api/create-payment-intent", {
                amount: pricing.totalTTC,
                orderId: "temp-".concat(Date.now()), // Temporary ID
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                setClientSecret(data.clientSecret);
            })
                .catch(function (error) {
                console.error("Error creating payment intent:", error);
            });
        }
    }, [bookingData.service, pricing.totalTTC]);
    if (!clientSecret) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"/>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center mb-6">
        <Lock className="h-6 w-6 mr-3 text-primary-600"/>
        <h2 className="text-xl font-semibold text-slate-900">Paiement sécurisé</h2>
      </div>

      <Elements stripe={stripePromise} options={{
            clientSecret: clientSecret,
            appearance: {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#2563eb',
                },
            },
        }}>
        <CheckoutForm />
      </Elements>
    </div>);
}
