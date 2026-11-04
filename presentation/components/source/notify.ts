import { notifications } from '@mantine/notifications';

export type Severity = 'success' | 'info' | 'warn' | 'error';

export interface Message {
    summary: string;
    detail?: string;
    severity?: Severity;
    // tempo em tela, em milissegundos
    life?: number;
}

const colors: Record<Severity, string> = {
    success: 'teal',
    info: 'blue',
    warn: 'yellow',
    error: 'red',
};

/** Mostra uma notificação no canto da tela, no mesmo formato de mensagem que as telas publicam no PubSub ('showMessage'). */
export const notify = ({ summary, detail, severity = 'success', life = 10000 }: Message) =>
    notifications.show({
        title: summary,
        message: detail || '',
        color: colors[severity] || colors.success,
        autoClose: life,
        withBorder: true,
    });
