'use client';
import { useState } from 'react';
import Select from 'react-select';
import Modal from '@/presentation/modules/MeusDados/SobreMim/application/components/modal-composition';
import { usePreRegistration } from '@/presentation/Login/hooks/usePreRegistration';
import { useStore } from '@/presentation/Login/store/useStore';

export const ModalQuestionsAndAnswers = () => {
    const { handleSavePreRegistrationSubmission } = usePreRegistration();
    const { modalState, setModalState } = useStore();

    const comoNosConheceu = [
        { value: 'linkedin', label: 'Por alguém ou por anúncio no linkedin' },
        { value: 'telegram', label: 'Grupos de vagas no telegram' },
        { value: 'friends', label: 'Indicação de amigos' },
        { value: 'others', label: 'outros' },
    ];

    const qualObjetivo = [
        { value: 'jobs', label: 'Salários e Empregos' },
        { value: 'recruiting', label: 'Ver currículos' },
    ];

    const [selectComoNosConheceu, setSelectComoNosConheceu] = useState(comoNosConheceu[0].value);
    const [selectQualObjetivo, setSelectQualObjetivo] = useState(qualObjetivo[0].value);

    const handleComoNosConheceuChange = (newValue: { value: string; label: string } | null) => {
        if (newValue) {
            setSelectComoNosConheceu(newValue.value);
        }
    };

    const handleQualObjetivoChange = (newValue: { value: string; label: string } | null) => {
        if (newValue) {
            setSelectQualObjetivo(newValue.value);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        handleSavePreRegistrationSubmission(selectComoNosConheceu, selectQualObjetivo);
    };

    return (
        <Modal isOpen={modalState === 'registration'} onClose={() => setModalState(null)} title="Perguntas para te conhecer">
            <form onSubmit={handleSubmit}>
                <h5>Como você nos conheceu?</h5>
                <div className="mb-5 pb-2">
                    <Select defaultValue={comoNosConheceu[0]} options={comoNosConheceu} isSearchable={false} onChange={handleComoNosConheceuChange} />
                </div>
                <h5>Qual seu objetivo?</h5>
                <div className="mb-12">
                    <Select defaultValue={qualObjetivo[0]} options={qualObjetivo} isSearchable={false} onChange={handleQualObjetivoChange} />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                    Enviar
                </button>
            </form>
        </Modal>
    );
};
