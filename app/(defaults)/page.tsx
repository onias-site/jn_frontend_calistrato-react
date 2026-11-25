import { redirect } from 'next/navigation';

// desde 2026-11-24 a tela inicial é a das vagas do recrutador (até então eram as estatísticas das skills, que continuam em
// /estatisticas/telegram/vagas)
const Home = () => redirect('/meu-recrutamento/vagas');

export default Home;
