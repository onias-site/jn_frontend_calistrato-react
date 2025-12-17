"use client";

import IconStar from '@/presentation/icons/icon-star';
import {
  Container,
  Paper,
  Title,
  Text,
  Group,
  Button,
  Grid,
  Badge,
  Divider,
  Textarea,
  Stack,
  Box,
  Card,
  Flex,

} from '@mantine/core';


// Mock usuario
const candidateData = {
  id: "1",
  name: "Daniel Calistrato",
  email: "danesrj00@gmail.com",
  remoto: true,
  regiao: "São Paulo",
  empresasExcluidas: "Meta, Google",
  cargoRecenteAtual: "Desenvolvedor Full Stack Sênior",
  cargoDesejado: "Tech Lead",
  experiencia: "8 anos",
  clt: "false",
  pretensaoPJ: "R$ 15.000",
  pretensaoCLT: "R$ 12.000",
  pretensaoBTC: "0.2 BTC",
  reputacao: "85%",
  sobreMim: "Desenvolvedor Full Stack com 8 anos de experiência em tecnologias web modernas. Especializado em React, Node.js, TypeScript e arquiteturas cloud. Busco oportunidades desafiadoras como Tech Lead para aplicar minha experiência técnica e habilidades de liderança. Apaixonado por código limpo, boas práticas e mentoria de desenvolvedores júnior."
};

export default function PreviewCandidatoInd() {
  return (
    <Box
      className='min-h-screen  p-4'

    >
      <Container size="xl">
        <Stack className='gap-4'>
          {/* Header Section */}
          <Paper
            className='shadow-xl p-4 rounded-lg bg-white/95 backdrop-blur-10px border border-white/20'
            shadow="xl"
            p="xl"
            radius="lg"

          >
            <Flex
              className='flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2'

            >
              <Box>
                <Title order={1} size="h1" fw={700} c="dark.8" mb="xs">
                  {candidateData.name}
                </Title>
                <Group className='gap-2 text-gray-500'>
                  {/* <IconMail size={16} /> */}
                  <Text size="sm">{candidateData.email}</Text>
                </Group>
              </Box>
              <Group className='gap-2'>
                <Button className='bg-blue-500 text-white'
                  variant="outline"
                  // leftSection={<IconDownload size={16} />}
                  color="blue"
                  size="md"
                >
                  Download Currículo
                </Button>
                <Button className='bg-blue-500 text-white'
                  // leftSection={<IconEdit size={16} />}
                  gradient={{ from: 'blue', to: 'cyan' }}
                  size="md"
                >
                  Editar Currículo
                </Button>
              </Group>
            </Flex>
          </Paper>

          <Grid>

            <Grid.Col span={4}>
              <Card className='p-4 shadow-lg rounded-lg bg-white/95 backdrop-blur-10px border border-white/20 h-full'

              >
                <Group className='gap-2 mb-4'>
                  {/* <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                    <IconMapPin size={20} />
                  </ThemeIcon> */}
                  <Title order={3} size="h4" fw={600}>
                    Informações Pessoais
                  </Title>
                </Group>
                <Stack className='gap-4'>
                  <Box>
                    <Text className='text-sm text-gray-500 mb-2'>
                      Sistema de trabalho preferido
                    </Text>
                    <Badge
                      color={candidateData.remoto ? "green" : "blue"}
                      variant="light"
                      size="md"
                    >
                      {candidateData.remoto ? "Remoto" : "Presencial"}
                    </Badge>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      Minha Região
                    </Text>
                    <Text fw={500} size="md">
                      {candidateData.regiao}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      Empresas não desejadas
                    </Text>
                    <Text fw={500} size="sm">
                      {candidateData.empresasExcluidas}
                    </Text>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>


            <Grid.Col className='col-span-4' span={4}>
              <Card className='p-4 shadow-lg rounded-lg bg-white/95 backdrop-blur-10px border border-white/20 h-full'

              >
                <Group className='gap-2 mb-4'>
                  {/* <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'green', to: 'teal' }}>
                    <IconBriefcase size={20} />
                  </ThemeIcon> */}
                  <Title order={3} size="h4" fw={600}>
                    Dados da Carreira
                  </Title>
                </Group>
                <Stack className='gap-4'>
                  <Box>
                    <Text className='text-sm text-gray-500 mb-2'>
                      Cargo atual/mais recente
                    </Text>
                    <Text className='font-medium text-sm'>
                      {candidateData.cargoRecenteAtual}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      Cargo desejado
                    </Text>
                    <Text fw={500} size="md">
                      {candidateData.cargoDesejado}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      Experiência
                    </Text>
                    <Badge variant="outline" color="blue" size="md">
                      {candidateData.experiencia}
                    </Badge>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      Tipo de contrato preferido
                    </Text>
                    <Badge
                      color={candidateData.clt === "true" ? "blue" : "orange"}
                      variant="light"
                      size="md"
                    >
                      {candidateData.clt === "true" ? "CLT" : "PJ"}
                    </Badge>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col className='col-span-4' span={4}>
              <Card className='p-4 shadow-lg rounded-lg bg-white/95 backdrop-blur-10px border border-white/20 h-full'

              >


                <Group className='gap-2 mb-4'>
                  {/* <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'orange', to: 'red' }}>
                    <IconCurrencyDollar size={20} />
                  </ThemeIcon> */}
                  <Title order={3} size="h4" fw={600}>
                    Dados Salariais
                  </Title>
                </Group>
                <Stack className='gap-4'>
                  <Box>
                    <Text className='text-sm text-gray-500 mb-2'>
                      Pretensão PJ
                    </Text>
                    <Text fw={700} size="xl" c="green.6">
                      {candidateData.pretensaoPJ}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      Pretensão CLT
                    </Text>
                    <Text fw={700} size="xl" c="green.6">
                      {candidateData.pretensaoCLT}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      Pretensão BTC
                    </Text>
                    <Text fw={500} size="md">
                      {candidateData.pretensaoBTC}
                    </Text>
                  </Box>
                  <Divider />
                  <Group className='justify-between'>
                    <Group className='gap-2'>
                      <IconStar className='text-yellow-500' />
                      <Text size="sm" c="dimmed">
                        Reputação
                      </Text>
                    </Group>
                    <Badge variant="outline" color="yellow" size="md" fw={600}>
                      {candidateData.reputacao}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          <Paper
            shadow="xl"
            p="xl"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Title order={2} size="h3" fw={600} mb="lg">
              Sobre o Candidato
            </Title>
            <Textarea
              className='bg-gray-100 border border-gray-200 text-gray-800 text-sm leading-6'
              value={candidateData.sobreMim}
              readOnly
              minRows={8}

            />
          </Paper>

          <Paper
            className='p-4 backdrop-blur-10px border border-white/20 shadow-xl rounded-lg'

          >
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              justify="space-between"
              align={{ base: 'stretch', sm: 'center' }}
              gap="md"
            >
              <Box>
                <Title order={3} size="h4" fw={600} mb="xs">
                  Perfil Completo
                </Title>
                <Text size="sm" c="dimmed">
                  Todas as informações do candidato estão atualizadas e prontas para visualização.
                </Text>
              </Box>
              <Group className='gap-2'>
                <Button variant="outline" size="md">
                  Compartilhar Perfil
                </Button>
                <Button
                  className='bg-blue-500 text-white'

                  size="md"
                >
                  Candidatar-se a Vagas
                </Button>
              </Group>
            </Flex>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}