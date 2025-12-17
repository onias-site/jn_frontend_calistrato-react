'use client';
import Link from 'next/link';
import { useState } from 'react';

const HomePage = () => {
    const [showDemoForm, setShowDemoForm] = useState(false);
    const [showPlans, setShowPlans] = useState(false);
    return (
        <>
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            Home
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-6 py-16">
                    <div className="flex flex-col lg:flex-row items-center justify-between">

                        <div className="lg:w-1/2 mb-12 lg:mb-0">
                            <div className="mb-6">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Tudo o que você precisa
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                                para recrutar, gerir
                                <br />
                                <span className="text-blue-600 dark:text-blue-400">e acelerar contratações</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Encontre os melhores talentos, gerencie processos seletivos e construa equipes de alta performance com nossa plataforma completa de recrutamento.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setShowDemoForm(!showDemoForm)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {showDemoForm ? 'Fechar formulário' : 'Solicite uma demo'}
                                </button>
                                <button
                                    onClick={() => setShowPlans(!showPlans)}
                                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                                >
                                    {showPlans ? 'Fechar planos' : 'Conheça os planos'}
                                </button>
                            </div>
                        </div>


                        <div className="lg:w-1/2 lg:pl-12">
                            <div className="relative">

                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                 <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">Candidatos Qualificados</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Perfis verificados</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.5k+</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Este mês</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Desenvolvedores</span>
                                            <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">+15%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Designers</span>
                                            <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">+8%</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gerentes</span>
                                            <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">+12%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Secundário */}
                                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                             <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Match Perfeito</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">98% compatibilidade</div>
                                        </div>
                                    </div>
                                </div>


                                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transform rotate-12 hover:rotate-0 transition-transform duration-300">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">Produtividade</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">+40% mais rápido</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showDemoForm && (
                        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl">
                            <div className="max-w-4xl mx-auto">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold mb-4">
                                        JobsNow<br />
                                        Seu buscador de currículos<br />

                                    </h2>
                                    <p className="text-blue-100 text-lg">
                                        Solicite uma demonstração com nossos consultores.
                                    </p>
                                </div>

                                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Nome</label>
                                        <input
                                            type="text"
                                            placeholder="Seu nome"
                                            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Nome da empresa</label>
                                        <input
                                            type="text"
                                            placeholder="Empresa em que trabalha"
                                            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Telefone</label>
                                        <input
                                            type="tel"
                                            placeholder="Seu número com DDD"
                                            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">E-mail</label>
                                        <input
                                            type="email"
                                            placeholder="Seu melhor e-mail"
                                            className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex justify-center mt-4">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-lg transition-colors duration-200 text-lg shadow-lg hover:shadow-xl"
                                        >
                                            Solicitar demo
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}


                    {showPlans && (
                        <div className="mt-16">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    Nossos planos
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    Escolha o plano ideal para sua empresa
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {/* Plano Básico */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Básico</h3>
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">R$ 299</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">por mês</div>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Até 50 vagas ativas
                                        </li>
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Banco de currículos
                                        </li>
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Filtros básicos
                                        </li>
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Suporte por email
                                        </li>
                                    </ul>
                                    <button className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                                        Começar agora
                                    </button>
                                </div>

                                {/* Plano Profissional - Destaque */}
                                <div className="bg-blue-600 rounded-2xl shadow-xl p-8 text-white transform scale-105 relative">
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Mais Popular
                                        </span>
                                    </div>
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold mb-2">Profissional</h3>
                                        <div className="text-3xl font-bold mb-1">R$ 599</div>
                                        <div className="text-sm text-blue-100">por mês</div>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Vagas ilimitadas
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            IA para matching
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Filtros avançados
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Relatórios detalhados
                                        </li>
                                        <li className="flex items-center">
                                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Suporte prioritário
                                        </li>
                                    </ul>
                                    <button className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                                        Começar agora
                                    </button>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">R$ 1.299</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">por mês</div>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Tudo do Profissional
                                        </li>
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            API personalizada
                                        </li>
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Integração com HRIS
                                        </li>
                                        <li className="flex items-center text-gray-600 dark:text-gray-300">
                                            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Gerente de conta
                                        </li>
                                    </ul>
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                                        Falar com vendas
                                    </button>
                                </div>
                            </div>

                            <div className="text-center mt-12">
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Todos os planos incluem teste gratuito de 14 dias
                                </p>
                                <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Sem compromisso
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Cancele a qualquer momento
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Suporte incluído
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HomePage;
