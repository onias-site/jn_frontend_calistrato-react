interface PasswordRequirement {
    regex: RegExp;
    text: string;
    validator?: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
    { regex: /[A-Z]/, text: "Uma letra maiúscula" },
    { regex: /[a-z]/, text: "Uma letra minúscula" },
    { regex: /[0-9]/, text: "Um número" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "Um caractere especial" },
    {
        regex: /.{8,}/,
        text: "Mínimo 8 caracteres",
        validator: (password) => password.length >= 8
    },
];

interface Props {
    password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
    const getStrengthPercentage = () => {
        if (!password) return 0;
        const validRequirements = passwordRequirements.filter(req =>
            req.validator ? req.validator(password) : req.regex.test(password)
        ).length;
        return (validRequirements / passwordRequirements.length) * 100;
    };

    const strengthPercentage = getStrengthPercentage();
    const isAllValid = strengthPercentage === 100;
    const shouldShow = password.length > 0 && !isAllValid;

    // Não mostra nada se a senha estiver vazia ou se todos os requisitos estiverem válidos
    if (!shouldShow) {
        return null;
    }

    return (
        <div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${
                        strengthPercentage === 0
                            ? 'w-0'
                            : strengthPercentage <= 20
                            ? 'w-1/5 bg-red-500'
                            : strengthPercentage <= 40
                            ? 'w-2/5 bg-orange-500'
                            : strengthPercentage <= 60
                            ? 'w-3/5 bg-yellow-500'
                            : strengthPercentage <= 80
                            ? 'w-4/5 bg-lime-500'
                            : 'w-full bg-green-500'
                    }`}
                />
            </div>
            <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {passwordRequirements.map((req, index) => (
                    <div
                        key={index}
                        className={`text-[10px] sm:text-xs flex items-center gap-0.5 ${
                            (req.validator ? req.validator(password) : req.regex.test(password))
                                ? 'text-green-500'
                                : 'text-gray-400'
                        }`}
                    >
                        {(req.validator ? req.validator(password) : req.regex.test(password)) ? (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {req.text}
                    </div>
                ))}
            </div>
        </div>
    );
};
