import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlockedTokenError, InvalidEmailError, UserAlreadyLoggedError } from '@/domain/errors';
import { MissingEmailError } from '@/domain/errors/missing-email-error';
import { PasswordLockedRecentlyError } from '@/domain/errors/password-locked-recently-error';
import { WrongPasswordError } from '@/domain/errors/wrong-password-error';
import { useSavePasswordToken } from '../hooks/useSavePasswordToken';
import { useStore } from '@/presentation/Login/store/useStore';
import { TFormTokenPassword } from '../login.types';
import { tokenPasswordSchema } from '../login.schema';

export const useFormSavePasswordToken = () => {
    const emailUsuario = useStore(state => state.emailUsuarioState);
    const { handleTokenPasswordSubmission} = useSavePasswordToken()
    const {
        register,
        handleSubmit,
        setValue,
        setError,
        watch,
        formState: { errors,isSubmitting },
      } = useForm<TFormTokenPassword>({
        resolver: zodResolver(tokenPasswordSchema),
        criteriaMode: "all",
        mode: "all",
        defaultValues: {
          token: "",
          password: "",
          confirmPassword: "",
        },
      });

      const handleSetData = useCallback((data: Partial<TFormTokenPassword>) => {
        Object.keys(data).forEach(key => {
            setValue(key as keyof TFormTokenPassword, data[key as keyof TFormTokenPassword] ?? "");
        });
    }, [setValue]);

    const handleFormSubmit = async (data: TFormTokenPassword) => {
        try {
            const { token, password, confirmPassword } = data;
            await handleTokenPasswordSubmission(token, password, confirmPassword, emailUsuario as string);
            handleSetData({ token: '', password: '', confirmPassword: '' });
        } catch (error: any) {
            const errorMap = {
                [WrongPasswordError.name]: 'Senha incorreta',
                [BlockedTokenError.name]: 'Token bloqueado',
                [PasswordLockedRecentlyError.name]: 'Senha bloqueada recentemente, tente novamente mais tarde',
                [MissingEmailError.name]: 'Email não encontrado',
                [InvalidEmailError.name]: 'Email inválido',
                [UserAlreadyLoggedError.name]: 'Usuário já logado',
            };

            const errorMessage = errorMap[error.constructor.name] || 'Erro desconhecido, tente novamente';
            setError('password', { type: 'manual', message: errorMessage });
        }
    };

    return {
        register,
        handleSubmit,
        setValue,
        handleSetData,
        errors,
        isSubmitting,
        handleFormSubmit,
        watch,
    }
}

