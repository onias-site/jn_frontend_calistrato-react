import FormularioVaga from '@/presentation/modules/MeuRecrutamento/MinhasVagas/application/NovaVaga/formulario-vaga';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edita vagaId',
};

const EditarVaga = ({params}:any) => {

    return <FormularioVaga vagaId={params.editaId} />;
  };

  export default EditarVaga;

