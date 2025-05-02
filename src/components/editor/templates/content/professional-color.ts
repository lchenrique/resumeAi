import { v4 as uuidv4 } from 'uuid';
import { YooptaContentValue, createDivider } from '../utils';

// Template Profissional com Barra de Cores
// Este template inclui uma barra superior de cor personalizável
export const PROFESSIONAL_COLOR_TEMPLATE_CONTENT: YooptaContentValue = {
  "idNomeCompleto": {
    id: "idNomeCompleto",
    type: "HeadingOne",
    meta: { order: 0, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-one", children: [{ text: "Seu Nome Completo", bold: true }], props: { nodeType: "block" } }]
  },
  "idTituloProfissional": {
    id: "idTituloProfissional",
    type: "HeadingThree",
    meta: { order: 1, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Seu Cargo ou Título Profissional" }], props: { nodeType: "block" } }]
  },
  
  "idResumoTitle": {
    id: "idResumoTitle",
    type: "HeadingTwo",
    meta: { order: 2, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Perfil Profissional", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(2.1),
  "idTextoResumo": {
    id: "idTextoResumo",
    type: "Paragraph",
    meta: { order: 3, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Apresente aqui um resumo destacando seus pontos fortes, experiência relevante e objetivos de carreira. Procure transmitir sua proposta de valor e diferenciais competitivos." }], props: { nodeType: "block" } }]
  },
  
  "idInfoContatoTitle": {
    id: "idInfoContatoTitle",
    type: "HeadingTwo",
    meta: { order: 4, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Informações de Contato", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(4.1),
  "idInfoContato": {
    id: "idInfoContato",
    type: "Paragraph",
    meta: { order: 5, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Email: seu.email@exemplo.com | Telefone: (XX) XXXXX-XXXX | Localização: Cidade, Estado | LinkedIn: linkedin.com/in/seu-perfil" }], props: { nodeType: "block" } }]
  },
  
  "idExperienciaTitle": {
    id: "idExperienciaTitle",
    type: "HeadingTwo",
    meta: { order: 6, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Experiência Profissional", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(6.1),
  "idCargo1": {
    id: "idCargo1",
    type: "HeadingThree",
    meta: { order: 7, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Cargo Atual - Empresa Atual" }], props: { nodeType: "block" } }]
  },
  "idPeriodo1": {
    id: "idPeriodo1",
    type: "Paragraph",
    meta: { order: 8, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Janeiro 2020 - Presente" }], props: { nodeType: "block" } }]
  },
  "idDescricao1_1": {
    id: "idDescricao1_1",
    type: "BulletedList",
    meta: { order: 9, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Descreva uma responsabilidade ou conquista importante, preferencialmente com resultados quantificáveis." }], props: { nodeType: "block" } }]
  },
  "idDescricao1_2": {
    id: "idDescricao1_2",
    type: "BulletedList",
    meta: { order: 10, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Inclua projetos relevantes, iniciativas lideradas ou melhorias implementadas." }], props: { nodeType: "block" } }]
  },
  "idDescricao1_3": {
    id: "idDescricao1_3",
    type: "BulletedList",
    meta: { order: 11, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Mencione tecnologias, metodologias ou ferramentas utilizadas que sejam relevantes para a vaga pretendida." }], props: { nodeType: "block" } }]
  },
  
  "idCargo2": {
    id: "idCargo2",
    type: "HeadingThree",
    meta: { order: 12, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Cargo Anterior - Empresa Anterior" }], props: { nodeType: "block" } }]
  },
  "idPeriodo2": {
    id: "idPeriodo2",
    type: "Paragraph",
    meta: { order: 13, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Janeiro 2018 - Dezembro 2019" }], props: { nodeType: "block" } }]
  },
  "idDescricao2_1": {
    id: "idDescricao2_1",
    type: "BulletedList",
    meta: { order: 14, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Foque em realizações específicas e relevantes para a posição que você está buscando atualmente." }], props: { nodeType: "block" } }]
  },
  "idDescricao2_2": {
    id: "idDescricao2_2",
    type: "BulletedList",
    meta: { order: 15, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Use verbos de ação no passado (implementou, desenvolveu, coordenou) para descrever suas atividades." }], props: { nodeType: "block" } }]
  },
  
  "idFormacaoTitle": {
    id: "idFormacaoTitle",
    type: "HeadingTwo",
    meta: { order: 16, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Formação Acadêmica", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(16.1),
  "idFormacao1": {
    id: "idFormacao1",
    type: "HeadingThree",
    meta: { order: 17, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Curso - Instituição" }], props: { nodeType: "block" } }]
  },
  "idPeriodoFormacao1": {
    id: "idPeriodoFormacao1",
    type: "Paragraph",
    meta: { order: 18, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Ano de Início - Ano de Conclusão" }], props: { nodeType: "block" } }]
  },
  
  "idHabilidadesTitle": {
    id: "idHabilidadesTitle",
    type: "HeadingTwo",
    meta: { order: 19, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Competências", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(19.1),
  "idHabilidades": {
    id: "idHabilidades",
    type: "Paragraph",
    meta: { order: 20, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Habilidade Técnica 1, Habilidade Técnica 2, Habilidade Técnica 3, Habilidade Comportamental 1, Habilidade Comportamental 2" }], props: { nodeType: "block" } }]
  }
}; 