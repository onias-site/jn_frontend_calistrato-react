'use client'

import { Stepper } from '@mantine/core';
import { useVagas } from "@/presentation/contexts/vagasContex";
import ListaDeVagas from "./lista-vagas";
import { OptionsVagas } from "./options-vagas";
import { useState, useEffect } from 'react';
import { useStepperStore } from '../infra/store/stepper-store';

export const VagasContainer = () => {
    const { recordsData } = useVagas();
    const [tipoVaga, setTipoVaga] = useState<'ativas' | 'encerradas'>('ativas');
    const { currentStep, goToStep, setMaxSteps } = useStepperStore();

    useEffect(() => {
      setMaxSteps(2);
    }, [setMaxSteps]);

    const handleSelect = (tipo: 'ativas' | 'encerradas') => {
      setTipoVaga(tipo);
      goToStep(1);
    };

    const renderStep = () => {
      switch(currentStep) {
        case 0:
          return (
            <Stepper active={0} onStepClick={() => {}}>
                <OptionsVagas onSelect={handleSelect} />
            </Stepper>
          );
        case 1:
          return (
            <Stepper active={0} onStepClick={() => {}}>
                <ListaDeVagas
                  vagas={tipoVaga === 'ativas' ? recordsData.ativas : recordsData.encerradas}
                  tipo={tipoVaga}
                />
            </Stepper>
          );
        default:
          return null;
      }
    };

    return (
      <div>
        {renderStep()}
      </div>
    );
}
