import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlockedTokenError, InvalidCredentialsError, InvalidEmailError, UserAlreadyLoggedError } from '@/domain/errors';
import { useEmailExist } from '@/presentation/Login/hooks/useEmailExist';
import { emailSchema } from '../login.schema';
import { TFormData } from '../login.types';


export const useFormEmail = () => {
    const { handleEmailSubmission} = useEmailExist();
    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors,isSubmitting },
      } = useForm<TFormData>({
        resolver: zodResolver(emailSchema),
        criteriaMode: "all",
        mode: "all",
        defaultValues: {
          email: "",
        },
      });

      const handleSetData = useCallback((data: Partial<TFormData>) => {
        if (data.email !== undefined) {
            setValue("email", data.email);
        }
    }, []);

    const handleFormSubmit = async (data: TFormData) => {
        try {
            await handleEmailSubmission(data.email);
            handleSetData({ email: '' });
        } catch (error: any) {
            const errorMap = {
                [InvalidCredentialsError.name]: 'Credenciais inválidas',
                [InvalidEmailError.name]: 'Email inválido',
                [BlockedTokenError.name]: 'Token bloqueado. Por favor, envie um e-mail para onias@ccpjobsnow.com para desbloquear ou tente com outro e-mail. Verifique também sua caixa de spam.',
                [UserAlreadyLoggedError.name]: 'Usuário já logado',
            };

            const errorMessage = errorMap[error.constructor.name] || 'Erro desconhecido, tente novamente';
            setError('email', { type: 'manual', message: errorMessage });
        }
    };

    return {
        register,
        handleSubmit,
        setValue,
        handleSetData,
        errors,
        isSubmitting,
        handleFormSubmit
    }
}

