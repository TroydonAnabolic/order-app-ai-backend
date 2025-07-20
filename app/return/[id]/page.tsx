"use client";

import Link from "next/link";

const ReturnUrlStripe = () => {
    const isDev = process.env.NODE_ENV === "development";
    const deepLink = isDev
        ? "exp://192.168.1.12:8081/--/billing"
        : "exp://192.168.1.12:8081/--/billing"; // TODO: Update this to use the correct deep link for production
    //  : "orderappcompany://billing";

    return (
        <main className="relative isolate max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Linking Success
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    Congrats on linking your account.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        href={deepLink}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Return to Billing
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default ReturnUrlStripe;
