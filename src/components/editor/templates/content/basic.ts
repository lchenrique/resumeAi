import { v4 as uuidv4 } from 'uuid';
import { YooptaContentValue, createDivider } from '../utils'; // Importa do novo utils.ts

export const BASIC_TEMPLATE_CONTENT: YooptaContentValue = {
    "idHeader": {
      id: "idHeader",
      type: "HeadingOne",
      meta: {
        depth: 0,
        order: 0
      },
      value: [
        {
          id: uuidv4(),
          type: "heading-one",
          props: {
            nodeType: "block"
          },
          children: [
            {
              text: "Carlos Eduardo",
              bold: true
            }
          ]
        }
      ]
    },
    "idProfissao": {
      id: "idProfissao",
      type: "Paragraph",
      meta: {
        align: "left",
        depth: 0,
        order: 1
      },
      value: [
        {
          id: uuidv4(),
          type: "paragraph",
          children: [
            {
              text: "Desenvolvedor Full Stack | React | Node.js | TypeScript",
              italic: true
            }
          ],
          props: {
            nodeType: "block"
          }
        }
      ]
    },
    "idContato": {
      id: "idContato",
      type: "Paragraph",
      meta: {
        align: "left",
        depth: 0,
        order: 2
      },
      value: [
        {
          id: uuidv4(),
          type: "paragraph",
          children: [
            {
              text: "São Paulo, SP • (11) 98765-4321 • joao@email.com • linkedin.com/in/joaodasilva"
            }
          ],
          props: {
            nodeType: "block"
          }
        }
      ]
    },
    "idTituloResumo": {
      id: "idTituloResumo",
      type: "HeadingTwo",
      meta: {
        depth: 0,
        order: 3
      },
      value: [
        {
          id: uuidv4(),
          type: "heading-two",
          props: {
            nodeType: "block"
          },
          children: [
            {
              text: "Resumo Profissional",
              bold: true
            }
          ]
        }
      ]
    },
    ...createDivider(3.1),
    "idResumo": {
      id: "idResumo",
      type: "Paragraph",
      meta: {
        align: "left",
        depth: 0,
        order: 4
      },
      value: [
        {
          id: uuidv4(),
          type: "paragraph",
          children: [
            {
              text: "Desenvolvedor Full Stack com 5 anos de experiência em criar aplicações web responsivas e intuitivas. Especializado em React, Node.js e TypeScript, com sólidos conhecimentos em arquitetura de software e práticas de desenvolvimento ágil."
            }
          ],
          props: {
            nodeType: "block"
          }
        }
      ]
    },
    "idTituloExperiencia": {
      id: "idTituloExperiencia",
      type: "HeadingTwo",
      meta: {
        depth: 0,
        order: 5
      },
      value: [
        {
          id: uuidv4(),
          type: "heading-two",
          props: {
            nodeType: "block"
          },
          children: [
            {
              text: "Experiência Profissional",
              bold: true
            }
          ]
        }
      ]
    },
    ...createDivider(5.1),
    "idEmpresa1": {
      id: "idEmpresa1",
      type: "HeadingThree",
      meta: {
        depth: 0,
        order: 6
      },
      value: [
        {
          id: uuidv4(),
          type: "heading-three",
          props: {
            nodeType: "block"
          },
          children: [
            {
              text: "Desenvolvedor Full Stack Senior - Empresa XYZ"
            }
          ]
        }
      ]
    },
    "idPeriodo1": {
      id: "idPeriodo1",
      type: "Paragraph",
      meta: {
        align: "left",
        depth: 0,
        order: 7
      },
      value: [
        {
          id: uuidv4(),
          type: "paragraph",
          children: [
            {
              text: "Março 2020 - Presente"
            }
          ],
          props: {
            nodeType: "block"
          }
        }
      ]
    },
    "idRealizacao1": {
      id: "idRealizacao1",
      type: "BulletedList",
      meta: {
        depth: 0,
        order: 8
      },
      value: [
        {
          id: uuidv4(),
          type: "bulleted-list",
          children: [
            {
              text: "Liderou o desenvolvimento de um dashboard de analytics utilizado por mais de 500 clientes corporativos"
            }
          ],
          props: {
            nodeType: "block"
          }
        }
      ]
    },
    "idRealizacao2": {
      id: "idRealizacao2",
      type: "BulletedList",
      meta: {
        depth: 0,
        order: 9
      },
      value: [
        {
          id: uuidv4(),
          type: "bulleted-list",
          children: [
            {
              text: "Implementou uma arquitetura de microserviços que melhorou o tempo de carregamento em 40%"
            }
          ],
          props: {
            nodeType: "block"
          }
        }
      ]
    },
    "idRealizacao3": {
      id: "idRealizacao3",
      type: "BulletedList",
      meta: {
        depth: 0,
        order: 10
      },
      value: [
        {
          id: uuidv4(),
          type: "bulleted-list",
          children: [
            {
              text: "Mentoria de desenvolvedores júnior e revisão de código para garantir qualidade e práticas recomendadas"
            }
          ],
          props: {
            nodeType: "block"
          }
        }
      ]
    }
  };
  