import { v4 as uuidv4 } from 'uuid';
import { YooptaContentValue, createDivider } from '../utils';

// Template Contemporâneo com Layout em Grid
// Este template usa um layout moderno em grid com seções bem definidas
export const CONTEMPORARY_GRID_TEMPLATE_CONTENT: YooptaContentValue = {
  "idCabecalho": {
    id: "idCabecalho",
    type: "HeadingOne",
    meta: { order: 0, depth: 0, align: "center" },
    value: [{ id: uuidv4(), type: "heading-one", children: [{ text: "SEU NOME", bold: true }], props: { nodeType: "block" } }]
  },
  "idProfissao": {
    id: "idProfissao",
    type: "HeadingThree",
    meta: { order: 1, depth: 0, align: "center" },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Designer de Experiência do Usuário" }], props: { nodeType: "block" } }]
  },
  "idContato": {
    id: "idContato",
    type: "Paragraph",
    meta: { order: 2, depth: 0, align: "center" },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "contato@seudominio.com | (00) 00000-0000 | Cidade/Estado | linkedin.com/in/seuperfil" }], props: { nodeType: "block" } }]
  },
  ...createDivider(2.5),
  
  // Seção: Sobre Mim
  "idSobreTitulo": {
    id: "idSobreTitulo",
    type: "HeadingTwo",
    meta: { order: 3, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Sobre Mim", bold: true }], props: { nodeType: "block" } }]
  },
  "idSobreTexto": {
    id: "idSobreTexto",
    type: "Paragraph",
    meta: { order: 4, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Designer de UI/UX apaixonado por criar experiências de usuário intuitivas e visualmente atraentes. Combino criatividade com abordagem centrada no usuário para desenvolver soluções eficazes." }], props: { nodeType: "block" } }]
  },
  
  // Seção: Experiência
  "idExperienciaTitulo": {
    id: "idExperienciaTitulo",
    type: "HeadingTwo",
    meta: { order: 5, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Experiência", bold: true }], props: { nodeType: "block" } }]
  },
  
  // Experiência 1
  "idEmpresa1": {
    id: "idEmpresa1",
    type: "HeadingThree",
    meta: { order: 6, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Designer de UX Sênior | Empresa Atual" }], props: { nodeType: "block" } }]
  },
  "idPeriodo1": {
    id: "idPeriodo1",
    type: "Paragraph",
    meta: { order: 7, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Janeiro 2021 - Presente" }], props: { nodeType: "block" } }]
  },
  "idRealizacao1_1": {
    id: "idRealizacao1_1",
    type: "BulletedList",
    meta: { order: 8, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Liderou redesign completo do aplicativo principal, resultando em aumento de 45% na retenção de usuários." }], props: { nodeType: "block" } }]
  },
  "idRealizacao1_2": {
    id: "idRealizacao1_2",
    type: "BulletedList",
    meta: { order: 9, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Conduziu pesquisas com usuários e testes de usabilidade, gerando insights que nortearam decisões de design." }], props: { nodeType: "block" } }]
  },
  
  // Experiência 2
  "idEmpresa2": {
    id: "idEmpresa2",
    type: "HeadingThree",
    meta: { order: 10, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "UI Designer | Empresa Anterior" }], props: { nodeType: "block" } }]
  },
  "idPeriodo2": {
    id: "idPeriodo2",
    type: "Paragraph",
    meta: { order: 11, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Junho 2018 - Dezembro 2020" }], props: { nodeType: "block" } }]
  },
  "idRealizacao2_1": {
    id: "idRealizacao2_1",
    type: "BulletedList",
    meta: { order: 12, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Criou sistema de design unificado, melhorando a consistência e eficiência no desenvolvimento de produto." }], props: { nodeType: "block" } }]
  },
  "idRealizacao2_2": {
    id: "idRealizacao2_2",
    type: "BulletedList",
    meta: { order: 13, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Colaborou com desenvolvedores e stakeholders para garantir implementação precisa dos designs." }], props: { nodeType: "block" } }]
  },
  
  // Seção: Educação
  "idEducacaoTitulo": {
    id: "idEducacaoTitulo",
    type: "HeadingTwo",
    meta: { order: 14, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Educação", bold: true }], props: { nodeType: "block" } }]
  },
  "idFormacao1": {
    id: "idFormacao1",
    type: "HeadingThree",
    meta: { order: 15, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Bacharelado em Design" }], props: { nodeType: "block" } }]
  },
  "idInstituicao1": {
    id: "idInstituicao1",
    type: "Paragraph",
    meta: { order: 16, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Universidade Federal | 2014 - 2018" }], props: { nodeType: "block" } }]
  },
  
  // Seção: Habilidades em Grid
  "idHabilidadesTitulo": {
    id: "idHabilidadesTitulo",
    type: "HeadingTwo",
    meta: { order: 17, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Habilidades", bold: true }], props: { nodeType: "block" } }]
  },
  
  // Habilidades Grid - Coluna 1
  "idHabilidadesDesign": {
    id: "idHabilidadesDesign",
    type: "HeadingThree",
    meta: { order: 18, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Design" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesDesignLista": {
    id: "idHabilidadesDesignLista",
    type: "BulletedList",
    meta: { order: 19, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "UI/UX Design" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesDesignLista2": {
    id: "idHabilidadesDesignLista2",
    type: "BulletedList",
    meta: { order: 20, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Design Thinking" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesDesignLista3": {
    id: "idHabilidadesDesignLista3",
    type: "BulletedList",
    meta: { order: 21, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Wireframing" }], props: { nodeType: "block" } }]
  },
  
  // Habilidades Grid - Coluna 2
  "idHabilidadesFerramenta": {
    id: "idHabilidadesFerramenta",
    type: "HeadingThree",
    meta: { order: 22, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Ferramentas" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesFerramentaLista": {
    id: "idHabilidadesFerramentaLista",
    type: "BulletedList",
    meta: { order: 23, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Figma" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesFerramentaLista2": {
    id: "idHabilidadesFerramentaLista2",
    type: "BulletedList",
    meta: { order: 24, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Adobe Creative Suite" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesFerramentaLista3": {
    id: "idHabilidadesFerramentaLista3",
    type: "BulletedList",
    meta: { order: 25, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Sketch" }], props: { nodeType: "block" } }]
  },
  
  // Habilidades Grid - Coluna 3
  "idHabilidadesOutras": {
    id: "idHabilidadesOutras",
    type: "HeadingThree",
    meta: { order: 26, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Outras" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesOutrasLista": {
    id: "idHabilidadesOutrasLista",
    type: "BulletedList",
    meta: { order: 27, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "HTML/CSS" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesOutrasLista2": {
    id: "idHabilidadesOutrasLista2",
    type: "BulletedList",
    meta: { order: 28, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Prototyping" }], props: { nodeType: "block" } }]
  },
  "idHabilidadesOutrasLista3": {
    id: "idHabilidadesOutrasLista3", 
    type: "BulletedList",
    meta: { order: 29, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Pesquisa de Usuário" }], props: { nodeType: "block" } }]
  }
}; 