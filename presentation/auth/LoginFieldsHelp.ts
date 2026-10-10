// Textos do botão de ajuda (?) de cada campo das telas do modal de login: o que é o campo e como usá-lo.
// As regras citadas são as mesmas que as telas validam (senha em RequestPassword/SavePassword, token em SavePassword).

const PASSWORD_RULES =
    'A senha deve ter no mínimo 8 caracteres, com ao menos uma letra minúscula, uma letra maiúscula, um número e um caractere especial (ex.: ! @ # $ %).';

export const loginFieldsHelp = {
    email:
        'É o e-mail com que você entra no JobsNow. É também para ele que enviamos o token de criação de senha e os avisos sobre a sua conta. ' +
        'Como usar: digite um e-mail ao qual você tenha pleno acesso (ex.: nome@provedor.com) e clique em Avançar. ' +
        'Se for o seu primeiro acesso, pediremos que você confirme o e-mail e crie uma senha; se você já tiver uma senha, pediremos que a informe.',

    confirmEmail:
        'É a confirmação do e-mail digitado na tela anterior, para evitar que um erro de digitação leve o seu cadastro e o token de criação de senha para o endereço errado. ' +
        'Como usar: digite de novo exatamente o mesmo e-mail e clique em Confirmar; o botão só é liberado quando os dois forem iguais. ' +
        'Se perceber que digitou o e-mail errado antes, volte ao início pelo link abaixo e corrija.',

    loginPassword:
        'É a senha que você criou para entrar no JobsNow com este e-mail. ' +
        'Como usar: digite a sua senha e clique em Login; o ícone de olho ao lado mostra o que foi digitado. ' +
        PASSWORD_RULES +
        ' Depois de 3 tentativas erradas a senha é bloqueada por segurança e será preciso criar uma nova; se a esqueceu, use o link "Esqueceu sua senha?" abaixo.',

    newPassword:
        'É a nova senha que você usará para entrar no JobsNow com este e-mail. ' +
        'Como usar: digite a senha desejada; o indicador abaixo do campo mostra se ela é fácil ou difícil de descobrir, e o ícone de olho mostra o que foi digitado. ' +
        PASSWORD_RULES,

    confirmPassword:
        'É a repetição da nova senha, para garantir que ela foi digitada sem erros. ' +
        'Como usar: digite exatamente a mesma senha do campo anterior; enquanto as duas forem diferentes, o botão Salvar senha fica bloqueado.',

    token: (email: string) =>
        `É o código de segurança que enviamos para o e-mail '${email}', para confirmar que você tem acesso a ele antes de criar a senha. ` +
        'Como usar: abra o e-mail que enviamos (procure também no spam / lixo eletrônico), copie o token e cole-o aqui. ' +
        'Ele tem exatamente 8 caracteres, só letras maiúsculas e números. ' +
        'Depois de 3 tentativas erradas o token é bloqueado; se o e-mail não chegou, use o link de reenvio abaixo.',

    channel:
        'É o canal pelo qual você conheceu o JobsNow; essa informação nos ajuda a saber onde divulgar a plataforma. ' +
        'Como usar: abra a lista e escolha a opção que mais se aproxima; se nenhuma servir, escolha "outros".',

    goal:
        'É o que você pretende fazer no JobsNow: acompanhar salários e empregos, como candidato, ou ver currículos, como recrutador. ' +
        'Como usar: abra a lista e escolha o seu objetivo principal.',
};
