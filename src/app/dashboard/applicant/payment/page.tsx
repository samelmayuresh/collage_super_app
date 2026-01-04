'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmPayment } from '../../../../actions/admission';
import { CreditCard, Smartphone, Building, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';

export default function PaymentPage() {
    const [method, setMethod] = useState('CARD');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const AMOUNT = 50000;

    async function handlePayment() {
        setLoading(true);
        // Simulate Processing Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const result = await confirmPayment(AMOUNT, method);
        if (result.success) {
            router.push('/dashboard/applicant/payment/success');
        } else {
            alert(result.error || 'Payment Failed');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-4 sm:p-8 flex items-center justify-center">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Summary Section */}
                <div className="bg-[#1a1a1a] text-white p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold opacity-80 uppercase tracking-widest mb-1">Total Payable</h2>
                        <div className="text-4xl font-extrabold mb-8">₹{AMOUNT.toLocaleString()}</div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm opacity-70">
                                <span>Admission Fee</span>
                                <span>₹20,000</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-70">
                                <span>Tuition Fee (Sem 1)</span>
                                <span>₹25,000</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-70">
                                <span>Library & Lab</span>
                                <span>₹5,000</span>
                            </div>
                            <div className="h-px bg-white/20 my-4"></div>
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>₹{AMOUNT.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 relative z-10">
                        <div className="flex items-center gap-2 text-xs opacity-50">
                            <ShieldCheck size={14} />
                            <span>Secure Payment Gateway</span>
                        </div>
                    </div>

                    {/* Decorative Circle */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Payment Methods */}
                <div className="p-8 md:w-2/3">
                    <h1 className="text-2xl font-bold text-slate-800 mb-6">Select Payment Method</h1>

                    <div className="grid gap-4 mb-8">
                        <div
                            onClick={() => setMethod('CARD')}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${method === 'CARD' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'CARD' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">Credit / Debit Card</p>
                                <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                            </div>
                            {method === 'CARD' && <CheckCircle className="ml-auto text-indigo-600" size={20} />}
                        </div>

                        <div
                            onClick={() => setMethod('UPI')}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${method === 'UPI' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'UPI' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">UPI / QR Code</p>
                                <p className="text-xs text-gray-500">GPay, PhonePe, Paytm</p>
                            </div>
                            {method === 'UPI' && <CheckCircle className="ml-auto text-indigo-600" size={20} />}
                        </div>

                        <div
                            onClick={() => setMethod('NETBANKING')}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4 ${method === 'NETBANKING' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method === 'NETBANKING' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                <Building size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">Net Banking</p>
                                <p className="text-xs text-gray-500">All Major Banks Supported</p>
                            </div>
                            {method === 'NETBANKING' && <CheckCircle className="ml-auto text-indigo-600" size={20} />}
                        </div>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Pay ₹${AMOUNT.toLocaleString()}`
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">By proceeding, you verify that all admission details provided are correct.</p>
                </div>
            </div>
        </div>
    );
}
