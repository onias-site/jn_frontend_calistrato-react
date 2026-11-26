import FormularioVaga from '@/presentation/modules/MeuRecrutamento/MinhasVagas/application/NovaVaga/formulario-vaga';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edita vagaId',
};

// no Next 15 os params da rota chegam como Promise
const EditarVaga = async ({ params }: { params: Promise<{ editaId: string }> }) => {
    const { editaId } = await params;
    return <FormularioVaga vagaId={editaId} />;
  };

  export default EditarVaga;

