import { v4 as uuidv4 } from 'uuid';
import { YooptaContentValue, createDivider } from '../utils';

// Template Título Destacado
// O estilo do título H1 será aplicado via CSS
export const HEADING_ACCENT_TEMPLATE_CONTENT: YooptaContentValue = {
  "idNomeCompleto": {
    id: "idNomeCompleto",
    type: "HeadingOne",
    meta: { order: 0, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-one", children: [{ text: "Seu Nome Completo" }], props: { nodeType: "block" } }]
  },
  "idTituloProfissional": {
    id: "idTituloProfissional",
    type: "HeadingThree",
    meta: { order: 1, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Título ou Cargo Principal" }], props: { nodeType: "block" } }]
  },
  "idContatoInfo": {
    id: "idContatoInfo",
    type: "Paragraph",
    meta: { order: 2, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Telefone | Email | Localização | LinkedIn" }], props: { nodeType: "block" } }]
  },
  ...createDivider(2.5),
  "idResumoTitulo": {
    id: "idResumoTitulo",
    type: "HeadingTwo",
    meta: { order: 3, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Resumo", bold: true }], props: { nodeType: "block" } }]
  },
  "idResumoTexto": {
    id: "idResumoTexto",
    type: "Paragraph",
    meta: { order: 4, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Breve resumo de suas qualificações e objetivos." }], props: { nodeType: "block" } }]
  },
  "idExperienciaTitulo": {
    id: "idExperienciaTitulo",
    type: "HeadingTwo",
    meta: { order: 5, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Experiência", bold: true }], props: { nodeType: "block" } }]
  },
  // Adicione blocos de experiência aqui...
  "idFormacaoTitulo": {
    id: "idFormacaoTitulo",
    type: "HeadingTwo",
    meta: { order: 6, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Formação", bold: true }], props: { nodeType: "block" } }]
  },
  // Adicione blocos de formação aqui...
}; 