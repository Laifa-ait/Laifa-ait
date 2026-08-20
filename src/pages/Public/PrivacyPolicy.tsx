import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation();
    const [policyText, setPolicyText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const res = await fetch('/api/v1/public/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.privacyPolicy) {
                        setPolicyText(data.privacyPolicy);
                    } else {
                        setPolicyText("La politique de confidentialité n'a pas encore été définie.");
                    }
                } else {
                    setPolicyText("La politique de confidentialité n'a pas encore été définie.");
                }
            } catch (error) {
                console.error("Error fetching policy:", error);
                setPolicyText("La politique de confidentialité n'a pas encore été définie.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPolicy();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[50vh] bg-transparent">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-100">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone-100">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-stone-900 tracking-tight">{t("Politique de Confidentialité")}</h1>
                            <p className="text-sm font-medium text-stone-500 mt-1">{t("Consultez les informations concernant vos données.")}</p>
                        </div>
                    </div>

                    <div className="prose prose-stone max-w-none prose-p:text-sm prose-p:leading-relaxed prose-headings:font-sans font-bold">
                        <ReactMarkdown>{policyText}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};
