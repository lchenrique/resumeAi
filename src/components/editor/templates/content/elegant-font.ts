import { v4 as uuidv4 } from 'uuid';
import { YooptaContentValue, createDivider } from '../utils';

// Template Elegante com Fontes Personalizáveis
// Este template permite escolher diferentes estilos de fontes
export const ELEGANT_FONT_TEMPLATE_CONTENT: YooptaContentValue = {
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
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "Especialista em Sua Área" }], props: { nodeType: "block" } }]
  },
  ...createDivider(1.5),
  
  "idContatoInfo": {
    id: "idContatoInfo",
    type: "Paragraph",
    meta: { order: 2, depth: 0, align: "center" },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "seu.email@exemplo.com • (XX) XXXXX-XXXX • Cidade, Estado • linkedin.com/in/seu-perfil" }], props: { nodeType: "block" } }]
  },
  
  "idPerfilTitle": {
    id: "idPerfilTitle",
    type: "HeadingTwo",
    meta: { order: 3, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "PERFIL PROFISSIONAL", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(3.1),
  "idPerfilDesc": {
    id: "idPerfilDesc",
    type: "Paragraph",
    meta: { order: 4, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Profissional com X anos de experiência em sua área de atuação, com especialidade em A, B e C. Focado em resultados e comprometido com a excelência. Combina habilidades técnicas avançadas com forte capacidade de comunicação e liderança." }], props: { nodeType: "block" } }]
  },
  
  "idExperienciaTitle": {
    id: "idExperienciaTitle",
    type: "HeadingTwo",
    meta: { order: 5, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "EXPERIÊNCIA PROFISSIONAL", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(5.1),
  "idEmpresa1": {
    id: "idEmpresa1",
    type: "HeadingThree",
    meta: { order: 6, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "EMPRESA ATUAL", bold: true }], props: { nodeType: "block" } }]
  },
  "idCargoPeriodo1": {
    id: "idCargoPeriodo1",
    type: "Paragraph",
    meta: { order: 7, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Cargo Atual | Jan 2020 - Presente", italic: true }], props: { nodeType: "block" } }]
  },
  "idDesc1_1": {
    id: "idDesc1_1",
    type: "BulletedList",
    meta: { order: 8, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Liderou iniciativa estratégica que resultou em aumento de 30% na eficiência operacional da equipe." }], props: { nodeType: "block" } }]
  },
  "idDesc1_2": {
    id: "idDesc1_2",
    type: "BulletedList",
    meta: { order: 9, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Implementou sistema que automatizou processos críticos, reduzindo custos em 25% e tempo de execução em 40%." }], props: { nodeType: "block" } }]
  },
  "idDesc1_3": {
    id: "idDesc1_3",
    type: "BulletedList",
    meta: { order: 10, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Gerenciou equipe multidisciplinar de X profissionais, coordenando projetos com orçamento total de R$ Y milhões." }], props: { nodeType: "block" } }]
  },
  
  "idEmpresa2": {
    id: "idEmpresa2",
    type: "HeadingThree",
    meta: { order: 11, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "EMPRESA ANTERIOR", bold: true }], props: { nodeType: "block" } }]
  },
  "idCargoPeriodo2": {
    id: "idCargoPeriodo2",
    type: "Paragraph",
    meta: { order: 12, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Cargo Anterior | Jan 2018 - Dez 2019", italic: true }], props: { nodeType: "block" } }]
  },
  "idDesc2_1": {
    id: "idDesc2_1",
    type: "BulletedList",
    meta: { order: 13, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Supervisionou o desenvolvimento e implementação de projeto estratégico, concluído 15% antes do prazo e 10% abaixo do orçamento." }], props: { nodeType: "block" } }]
  },
  "idDesc2_2": {
    id: "idDesc2_2",
    type: "BulletedList",
    meta: { order: 14, depth: 0 },
    value: [{ id: uuidv4(), type: "bulleted-list", children: [{ text: "Contribuiu para o aumento de X% na satisfação dos clientes através de melhorias nos processos de atendimento." }], props: { nodeType: "block" } }]
  },
  
  "idEducacaoTitle": {
    id: "idEducacaoTitle",
    type: "HeadingTwo",
    meta: { order: 15, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "EDUCAÇÃO", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(15.1),
  "idEducacao1": {
    id: "idEducacao1",
    type: "HeadingThree",
    meta: { order: 16, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-three", children: [{ text: "TÍTULO DO CURSO", bold: true }], props: { nodeType: "block" } }]
  },
  "idInstituicaoPeriodo1": {
    id: "idInstituicaoPeriodo1",
    type: "Paragraph",
    meta: { order: 17, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Nome da Instituição | Ano de Conclusão", italic: true }], props: { nodeType: "block" } }]
  },
  
  "idCompetenciasTitle": {
    id: "idCompetenciasTitle",
    type: "HeadingTwo",
    meta: { order: 18, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "COMPETÊNCIAS", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(18.1),
  "idCompetenciasTec": {
    id: "idCompetenciasTec",
    type: "Paragraph",
    meta: { order: 19, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Competência Técnica 1 • Competência Técnica 2 • Competência Técnica 3 • Competência Técnica 4" }], props: { nodeType: "block" } }]
  },
  "idCompetenciasComp": {
    id: "idCompetenciasComp",
    type: "Paragraph",
    meta: { order: 20, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Habilidade Comportamental 1 • Habilidade Comportamental 2 • Habilidade Comportamental 3" }], props: { nodeType: "block" } }]
  },
  
  "idIdiomasTitle": {
    id: "idIdiomasTitle",
    type: "HeadingTwo",
    meta: { order: 21, depth: 0 },
    value: [{ id: uuidv4(), type: "heading-two", children: [{ text: "IDIOMAS", bold: true }], props: { nodeType: "block" } }]
  },
  ...createDivider(21.1),
  "idIdiomas": {
    id: "idIdiomas",
    type: "Paragraph",
    meta: { order: 22, depth: 0 },
    value: [{ id: uuidv4(), type: "paragraph", children: [{ text: "Português (Nativo) • Inglês (Fluente) • Espanhol (Intermediário)" }], props: { nodeType: "block" } }]
  }
}; 