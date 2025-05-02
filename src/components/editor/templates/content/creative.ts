import { v4 as uuidv4 } from 'uuid';
import { YooptaContentValue, createDivider } from '../utils';

// Template Criativo
export const CREATIVE_TEMPLATE_CONTENT: YooptaContentValue = {
  "idNomeArtista": {
    id: "idNomeArtista",
    type: "HeadingOne",
    meta: { order: 0, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-one", children: [{ text: "Nome Artístico ou Completo", bold: true }], props: { nodeType: "block" } }]
  },
  "idAreaAtuacao": {
    id: "idAreaAtuacao",
    type: "Paragraph",
    meta: { order: 1, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Designer Gráfico | Ilustrador | Artista Visual", italic: true }], props: { nodeType: "block" } }]
  },
  "idContatoCriativo": {
    id: "idContatoCriativo",
    type: "Paragraph",
    meta: { order: 2, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "seu.email@criativo.com • portfolio.com/link • @seu_instagram" }], props: { nodeType: "block" } }]
  },
  
  "idTituloPerfil": {
    id: "idTituloPerfil",
    type: "HeadingTwo",
    meta: { order: 3, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Meu Olhar Criativo" }], props: { nodeType: "block" } }]
  },
  ...createDivider(3.1),
  "idTextoPerfil": {
    id: "idTextoPerfil",
    type: "Paragraph",
    meta: { order: 4, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Apaixonado por transformar ideias em visuais impactantes. Experiência em [Sua Área Principal] com foco em [Seu Diferencial]. Buscando oportunidades para colaborar em projetos que desafiem a criatividade." }], props: { nodeType: "block" } }]
  },
  
  "idTituloProjetos": {
    id: "idTituloProjetos",
    type: "HeadingTwo",
    meta: { order: 5, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Projetos Destacados" }], props: { nodeType: "block" } }]
  },
  ...createDivider(5.1),
  "idProjeto1Nome": {
    id: "idProjeto1Nome",
    type: "HeadingThree",
    meta: { order: 6, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Nome do Projeto Criativo 1" }], props: { nodeType: "block" } }]
  },
  "idProjeto1Desc": {
    id: "idProjeto1Desc",
    type: "Paragraph",
    meta: { order: 7, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Breve descrição do projeto, seu papel e as tecnologias/técnicas usadas. Link: [link-projeto]" }], props: { nodeType: "block" } }]
  },
   "idProjeto2Nome": {
    id: "idProjeto2Nome",
    type: "HeadingThree",
    meta: { order: 8, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Nome do Projeto Criativo 2" }], props: { nodeType: "block" } }]
  },
  "idProjeto2Desc": {
    id: "idProjeto2Desc",
    type: "Paragraph",
    meta: { order: 9, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Descrição do segundo projeto. Destaque resultados ou desafios superados. Link: [link-projeto]" }], props: { nodeType: "block" } }]
  },
  // (Adicione mais projetos)

  "idTituloSkills": {
    id: "idTituloSkills",
    type: "HeadingTwo",
    meta: { order: 10, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Ferramentas & Talentos" }], props: { nodeType: "block" } }]
  },
  ...createDivider(10.1),
  "idSkillsTexto": {
    id: "idSkillsTexto",
    type: "Paragraph",
    meta: { order: 11, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Software: Adobe Creative Suite (Photoshop, Illustrator, InDesign), Figma, Procreate. Técnicas: Ilustração Digital, Design de Identidade Visual, Tipografia. Conceitos: Teoria das Cores, Storytelling Visual." }], props: { nodeType: "block" } }]
  },

  "idTituloExperienciaCriativa": {
    id: "idTituloExperienciaCriativa",
    type: "HeadingTwo",
    meta: { order: 12, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "Experiências & Colaborações" }], props: { nodeType: "block" } }]
  },
   ...createDivider(12.1),
   // (Estrutura similar à experiência do template básico, mas com foco criativo)
  "idExpCriativa1": {
    id: "idExpCriativa1",
    type: "HeadingThree",
    meta: { order: 13, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Freelancer / Colaborador - Cliente/Agência XYZ" }], props: { nodeType: "block" } }]
  },
  "idPeriodoExpCriativa1": {
    id: "idPeriodoExpCriativa1",
    type: "Paragraph",
    meta: { order: 14, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Período (ex: Jan 2022 - Dez 2023)" }], props: { nodeType: "block" } }]
  },
  "idDescExpCriativa1": {
    id: "idDescExpCriativa1",
    type: "BulletedList",
    meta: { order: 15, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Desenvolvimento de identidade visual para marca [Nome da Marca]." }], props: { nodeType: "block" } }]
  },
}; 