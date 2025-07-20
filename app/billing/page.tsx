"use client";

const BillingPage = () => {
    const handleLinkStripeAccount = () => {
        // Use different deep link based on environment
        const isDev = process.env.NODE_ENV === "development";
        const deepLink = isDev
            ? "exp://192.168.1.12:8081/--/billing"
            : "orderappcompany://billing";
        window.location.href = deepLink;
    };

    return (
        <main className="relative isolate max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Billing
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    Manage your billing and payment methods here.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <button
                        onClick={handleLinkStripeAccount}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Return to Billing
                    </button>
                </div>
            </div>
        </main>
    );
};

export default BillingPage;