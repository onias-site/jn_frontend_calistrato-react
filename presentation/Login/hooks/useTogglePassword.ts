import { useState } from "react";



export const useTogglePassword = () => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return { showPassword, togglePasswordVisibility };
};

