import { useForm } from "react-hook-form";
import { candidatoSchema, FormData } from "../../schema/candidato-schema";
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from "@tanstack/react-query";
import { makeRemoteEditCandidato } from "@/main/factories/usecases/candidatos/remote-edit-candidatos-factory";
import { makeRemoteAddCandidato } from "@/main/factories/usecases/candidatos/remote-add-candidatos-factory";
import { ViewCandidatoModel } from "@/domain/models/view-canditato-model";
import CandidatosStore, { ICandidatoStore } from "../../store/candidados-store";
import useFiltroCandidatoStore from "@/presentation/modules/MeuRecrutamento/MinhasVagas/infra/store/filtro-candidato-store";
import { EditCandidato } from "@/domain/usecases/candidato";

export const useFormCandidato = () => {

    const stepper = CandidatosStore((state:ICandidatoStore) => state.stepper);
    const setStepper = CandidatosStore((state:ICandidatoStore) => state.setStepper);
    const idCandidato = CandidatosStore((state:ICandidatoStore) => state.idCandidato);
    const { estados } = useFiltroCandidatoStore();

    const {
        register,
        reset,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(candidatoSchema),
        mode: 'onChange',
    });
    const queryClient = useQueryClient();
    const onSubmit = async (data: FormData) => {
        if (stepper < 3) {
            return;
        }

        const estadosComSelecao = estados.map((estado) => ({
            ...estado,
            selected: estado.id === data.estadoSelecionadoId,
        }));
        const formData: EditCandidato.Params = {
            id: idCandidato,
            empresasExcluidas: data.empresasExcluidas ? [data.empresasExcluidas] : [],
            vagaExclusivaPCD: data.vagaExclusivaPCD ? 'true' : 'false',
            cargoRecenteAtual: data.cargoRecenteAtual,
            cargoDesejado: data.cargoDesejado,
            experiencia: data.experiencia,
            estadoSelecionadoId: data.estadoSelecionadoId,
            sobremim: data.sobreMim,
            remoto: !!data.remoto,
            hibrido: !!data.hibrido,
            presencial: !!data.presencial,
            pcd: !!data.pcd,
            clt: !!data.clt,
            pj: !!data.pj,
            btc: !!data.btc,
            pagamentopj: data.pagamentopj || '',
            pagamentoclt: data.pagamentoclt || '',
            pagamentobtc: data.pagamentobtc || '',
            pretensaoPJ: data.pretensaoPJ || '',
            pretensaoCLT: data.pretensaoCLT || '',
            estados: estadosComSelecao,
        };

        let response;

        const editarCandidato = makeRemoteEditCandidato(idCandidato);
        const addCandidato = makeRemoteAddCandidato();
        if (idCandidato) {
            response = await editarCandidato.edit(formData);
        } else {
            response = await addCandidato.add(formData);
        }

        queryClient.setQueryData(['candidatos'], (oldData: ViewCandidatoModel[] | undefined) => {
            if (oldData) {
                if (idCandidato) {
                    return oldData.map((candidato) => (candidato.id === response.id ? response : candidato));
                } else {
                    return [...oldData, response];
                }
            }
        });

        reset();
        return [response];
    };

    const nextStep = async () => {
        setStepper(stepper + 1);
    };

    return{
        onSubmit,
        register,
        reset,
        handleSubmit,
        setValue,
        errors,
        nextStep,
    }
}
