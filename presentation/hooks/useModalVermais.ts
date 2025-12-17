import { useState } from 'react';

const useModalVerMais = (initialValue: boolean) => {
  const [isOpen, setIsOpen] = useState(initialValue);
  const [content, setContent] = useState('');

  const openModal = (newContent: string) => {
    setContent(newContent);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return { isOpen, content, openModal, closeModal };
};


export default useModalVerMais
