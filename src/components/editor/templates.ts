import { v4 as uuidv4 } from 'uuid';
import { ResumeTemplate } from './initial';


export interface YooptaContentValue {
  [key: string]: {
    id: string;
    type: string;
    meta: {
      depth: number;
      order: number;
      align?: 'left' | 'center' | 'right';
    };
    value: {
      id: string;
      type: string;
      children: { text: string, bold?: boolean, italic?: boolean, code?: boolean, highlight?: {color?:string, backgroundColor?: string} }[];
      props?: {
        nodeType: string;

      }
    }[];
  };
}

// Função helper para criar Divider
const createDivider = (order: number): YooptaContentValue => ({
  [`idDivider${order}`]: {
    id: `idDivider${order}`,
    type: "Divider",
    meta: { depth: 0, order },
    value: [{ id: uuidv4(), type: "divider", children: [{ text: "" }], props: { nodeType: "block" } }]
  }
});

// Template Básico Completo
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
            text: "João da Silva",
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

// Novo Template Profissional
export const PROFESSIONAL_TEMPLATE_CONTENT: YooptaContentValue = {
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
            text: "Ricardo Almeida",
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
            text: "Gerente de Projetos | PMP | Agile Coach",
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
            text: "Brasília, DF • +55 (61) 99432-1876 • ricardo.almeida@email.com • linkedin.com/in/ricardoalmeida"
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
            text: "Perfil Executivo",
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
            text: "Gerente de Projetos certificado PMP com mais de 10 anos de experiência liderando equipes multidisciplinares em projetos de tecnologia e transformação digital. Especialista em metodologias ágeis e tradicional (waterfall), com histórico comprovado de entrega de projetos dentro do prazo e orçamento. Forte capacidade de comunicação, liderança e resolução de problemas complexos."
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloCompetencias": {
    id: "idTituloCompetencias",
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
            text: "Competências-Chave",
            bold: true
          }
        ]
      }
    ]
  },
  ...createDivider(5.1),
  "idCompetencias": {
    id: "idCompetencias",
    type: "Paragraph",
    meta: {
      align: "left",
      depth: 0,
      order: 6
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Gestão de Projetos • Metodologias Ágeis (Scrum, Kanban) • PMBOK • MS Project • Jira • Power BI • Gestão de Riscos • Gestão de Stakeholders • Liderança de Equipes • Orçamento e Controle Financeiro"
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
      order: 7
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
  ...createDivider(7.1),
  "idEmpresa1": {
    id: "idEmpresa1",
    type: "HeadingThree",
    meta: {
      depth: 0,
      order: 8
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
            text: "Gerente de Projetos Sênior - Consultoria Empresarial Global"
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
      order: 9
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Janeiro 2018 - Presente"
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
      order: 10
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Liderou a transformação digital de uma instituição financeira de grande porte, resultando em redução de 40% nos custos operacionais e aumento de 25% na satisfação dos clientes"
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
      order: 11
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Implementou metodologias ágeis em uma organização tradicionalmente waterfall, treinando mais de 100 profissionais e estabelecendo um PMO Ágil"
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
      order: 12
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Gerenciou um portfólio de projetos com orçamento anual de R$ 15 milhões, garantindo ROI médio de 145% através de governança efetiva e gestão de riscos"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  }
};

// Novo Template Criativo
export const CREATIVE_TEMPLATE_CONTENT: YooptaContentValue = {
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
            text: "Amanda Costa",
            bold: true,
            highlight: { backgroundColor: '#FFFBEB' }
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
            text: "Designer Gráfica & Ilustradora",
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
            text: "Florianópolis, SC • instagram.com/amandacosta.design • hello@amandacosta.design"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idSobre": {
    id: "idSobre",
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
            text: "Sobre Mim",
            bold: true
          }
        ]
      }
    ]
  },
  "idSobreTexto": {
    id: "idSobreTexto",
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
            text: "Designer gráfica apaixonada por contar histórias através de imagens. Com 7 anos de experiência em branding, ilustração e design editorial, busco projetos que unem criatividade e estratégia para criar conexões significativas entre marcas e pessoas."
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
            text: "Experiência Criativa",
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
            text: "Designer Sênior - Estúdio Criativo Imaginário"
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
            text: "2020 - Presente"
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
            text: "Criação de identidades visuais premiadas para startups e empresas estabelecidas, incluindo um trabalho selecionado para o Anuário de Design Brasileiro"
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
            text: "Desenvolvimento de série de ilustrações para campanha de impacto social que alcançou mais de 2 milhões de pessoas nas redes sociais"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloHabilidades": {
    id: "idTituloHabilidades",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 10
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
            text: "Ferramentas & Habilidades",
            bold: true
          }
        ]
      }
    ]
  },
  "idHabilidade1": {
    id: "idHabilidade1",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 11
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Adobe Creative Suite (Photoshop, Illustrator, InDesign, After Effects)"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade2": {
    id: "idHabilidade2",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 12
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Ilustração Digital e Tradicional • Branding • Design Editorial • Motion Graphics • UI/UX"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  }
};

// Template Clássico - Elegante e tradicional
export const CLASSIC_TEMPLATE_CONTENT: YooptaContentValue = {
  "idHeader": {
    id: "idHeader",
    type: "HeadingOne",
    meta: {
      align: "center",
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
            text: "Ana Beatriz Mendonça",
            bold: true
          }
        ]
      }
    ]
  },
  ...createDivider(0.1),
  "idProfissao": {
    id: "idProfissao",
    type: "Paragraph",
    meta: {
      align: "center",
      depth: 0,
      order: 1
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Advogada Especialista em Direito Empresarial",
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
      align: "center",
      depth: 0,
      order: 2
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Belo Horizonte, MG • ana.mendonca@email.com • (31) 99876-5432 • OAB/MG 123.456"
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
            text: "RESUMO PROFISSIONAL",
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
            text: "Advogada com mais de 8 anos de experiência em direito empresarial e contratual, com foco em operações societárias e contratos comerciais nacionais e internacionais. Especialista em negociações complexas e estruturação jurídica de novos negócios. Comprometida com excelência na prestação de serviços jurídicos e atendimento personalizado ao cliente."
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloFormacao": {
    id: "idTituloFormacao",
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
            text: "FORMAÇÃO ACADÊMICA",
            bold: true
          }
        ]
      }
    ]
  },
  "idFormacao1": {
    id: "idFormacao1",
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
            text: "Especialização em Direito Empresarial e Contratos"
          }
        ]
      }
    ]
  },
  "idInstituicao1": {
    id: "idInstituicao1",
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
            text: "Fundação Getúlio Vargas (FGV) • 2016-2017"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idFormacao2": {
    id: "idFormacao2",
    type: "HeadingThree",
    meta: {
      depth: 0,
      order: 8
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
            text: "Bacharelado em Direito"
          }
        ]
      }
    ]
  },
  "idInstituicao2": {
    id: "idInstituicao2",
    type: "Paragraph",
    meta: {
      align: "left",
      depth: 0,
      order: 9
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Universidade Federal de Minas Gerais (UFMG) • 2010-2015"
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
      order: 10
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
            text: "EXPERIÊNCIA PROFISSIONAL",
            bold: true
          }
        ]
      }
    ]
  },
  "idEmpresa1": {
    id: "idEmpresa1",
    type: "HeadingThree",
    meta: {
      depth: 0,
      order: 11
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
            text: "Advogada Sênior - Mendonça, Silva & Associados"
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
      order: 12
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Janeiro 2019 - Presente"
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
      order: 13
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Assessoria jurídica em operações de fusões e aquisições para empresas de médio e grande porte, com transações superiores a R$ 50 milhões."
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
      order: 14
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Elaboração e negociação de contratos comerciais complexos, incluindo acordos internacionais e joint ventures."
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloIdiomas": {
    id: "idTituloIdiomas",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 15
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
            text: "IDIOMAS",
            bold: true
          }
        ]
      }
    ]
  },
  "idIdiomas": {
    id: "idIdiomas",
    type: "Paragraph",
    meta: {
      align: "left",
      depth: 0,
      order: 16
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Português (Nativo) • Inglês (Fluente) • Espanhol (Avançado) • Francês (Intermediário)"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloHabilidades": {
    id: "idTituloHabilidades",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 17
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
            text: "HABILIDADES",
            bold: true
          }
        ]
      }
    ]
  },
  "idHabilidade1": {
    id: "idHabilidade1",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 18
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Redação jurídica avançada e preparação de pareceres técnicos"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade2": {
    id: "idHabilidade2",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 19
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Gestão de conflitos e negociação contratual"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade3": {
    id: "idHabilidade3",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 20
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Análise de risco e compliance corporativo"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  }
};

// Template Elegante
export const ELEGANT_TEMPLATE_CONTENT: YooptaContentValue = {
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
            text: "Camila Ferreira",
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
            text: "Executiva de Finanças",
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
            text: "seuemail@elegante.com | (XX) XXXX-XXXX | linkedin.com/in/camila"
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
            text: "Perfil",
            bold: true,
            italic: true
          }
        ]
      }
    ]
  },
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
            text: "Executivo de Finanças com mais de 15 anos de experiência em gestão financeira estratégica e operações em empresas multinacionais. Especialista em planejamento financeiro, análise de investimentos e otimização de processos. Comprovada capacidade de liderar equipes e implementar transformações que resultam em economia de custos e crescimento sustentável."
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloCompetencias": {
    id: "idTituloCompetencias",
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
            text: "Competências-Chave",
            bold: true
          }
        ]
      }
    ]
  },
  "idCompetencias": {
    id: "idCompetencias",
    type: "Paragraph",
    meta: {
      align: "left",
      depth: 0,
      order: 6
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Gestão de Projetos • Metodologias Ágeis (Scrum, Kanban) • PMBOK • MS Project • Jira • Power BI • Gestão de Riscos • Gestão de Stakeholders • Liderança de Equipes • Orçamento e Controle Financeiro"
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
      order: 7
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
            text: "Experiência",
            bold: true
          }
        ]
      }
    ]
  },
  "idEmpresa1": {
    id: "idEmpresa1",
    type: "HeadingThree",
    meta: {
      depth: 0,
      order: 8
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
            text: "Designer Sênior - Estúdio Criativo Imaginário"
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
      order: 9
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "2020 - Presente"
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
      order: 10
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Criação de identidades visuais premiadas para startups e empresas estabelecidas, incluindo um trabalho selecionado para o Anuário de Design Brasileiro"
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
      order: 11
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Desenvolvimento de série de ilustrações para campanha de impacto social que alcançou mais de 2 milhões de pessoas nas redes sociais"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloHabilidades": {
    id: "idTituloHabilidades",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 12
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
            text: "Ferramentas & Habilidades",
            bold: true
          }
        ]
      }
    ]
  },
  "idHabilidade1": {
    id: "idHabilidade1",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 13
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Adobe Creative Suite (Photoshop, Illustrator, InDesign, After Effects)"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade2": {
    id: "idHabilidade2",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 14
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Ilustração Digital e Tradicional • Branding • Design Editorial • Motion Graphics • UI/UX"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  }
};

// Template Executivo
export const EXECUTIVE_TEMPLATE_CONTENT: YooptaContentValue = {
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
            text: "Paulo Roberto Cardoso",
            bold: true
          }
        ]
      }
    ]
  },
  ...createDivider(0.1),
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
            text: "Líder de Mercado | Estrategista de Negócios",
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
            text: "Brasília, DF • +55 (61) 99432-1876 • ricardo.almeida@email.com • linkedin.com/in/ricardoalmeida"
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
            text: "Perfil Executivo",
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
            text: "Gerente de Projetos certificado PMP com mais de 10 anos de experiência liderando equipes multidisciplinares em projetos de tecnologia e transformação digital. Especialista em metodologias ágeis e tradicional (waterfall), com histórico comprovado de entrega de projetos dentro do prazo e orçamento. Forte capacidade de comunicação, liderança e resolução de problemas complexos."
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloCompetencias": {
    id: "idTituloCompetencias",
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
            text: "Competências-Chave",
            bold: true
          }
        ]
      }
    ]
  },
  ...createDivider(5.1),
  "idCompetencias": {
    id: "idCompetencias",
    type: "Paragraph",
    meta: {
      align: "left",
      depth: 0,
      order: 6
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Gestão de Projetos • Metodologias Ágeis (Scrum, Kanban) • PMBOK • MS Project • Jira • Power BI • Gestão de Riscos • Gestão de Stakeholders • Liderança de Equipes • Orçamento e Controle Financeiro"
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
      order: 7
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
  ...createDivider(7.1),
  "idEmpresa1": {
    id: "idEmpresa1",
    type: "HeadingThree",
    meta: {
      depth: 0,
      order: 8
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
            text: "Gerente de Projetos Sênior - Consultoria Empresarial Global"
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
      order: 9
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Janeiro 2019 - Presente"
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
      order: 10
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Assessoria jurídica em operações de fusões e aquisições para empresas de médio e grande porte, com transações superiores a R$ 50 milhões."
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
      order: 11
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Elaboração e negociação de contratos comerciais complexos, incluindo acordos internacionais e joint ventures."
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloIdiomas": {
    id: "idTituloIdiomas",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 12
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
            text: "IDIOMAS",
            bold: true
          }
        ]
      }
    ]
  },
  "idIdiomas": {
    id: "idIdiomas",
    type: "Paragraph",
    meta: {
      align: "left",
      depth: 0,
      order: 13
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Português (Nativo) • Inglês (Fluente) • Espanhol (Avançado) • Francês (Intermediário)"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloHabilidades": {
    id: "idTituloHabilidades",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 14
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
            text: "HABILIDADES",
            bold: true
          }
        ]
      }
    ]
  },
  "idHabilidade1": {
    id: "idHabilidade1",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 15
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Redação jurídica avançada e preparação de pareceres técnicos"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade2": {
    id: "idHabilidade2",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 16
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Gestão de conflitos e negociação contratual"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade3": {
    id: "idHabilidade3",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 17
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Análise de risco e compliance corporativo"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  }
};

// Template Contemporâneo com Foto
export const CONTEMPORARY_PHOTO_TEMPLATE_CONTENT: YooptaContentValue = {
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
            text: "Sofia Martins",
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
            text: "Marketing Digital | Growth Hacker",
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
            text: "Curitiba, PR • (41) 98877-6655 • sofia.mkt@email.com • linkedin.com/in/sofiamartins"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idPlaceholderFoto": {
    id: "idPlaceholderFoto",
    type: "Paragraph",
    meta: {
      align: "right",
      depth: 0,
      order: 0
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        props: {
          nodeType: "block"
        },
        children: [
          {
            text: "[Espaço para Foto 100x100px]"
          }
        ]
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
            text: "Sobre Mim",
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
            text: "Profissional de Marketing Digital com foco em crescimento e aquisição de usuários. Experiência em SEO, SEM, marketing de conteúdo e análise de dados para otimizar campanhas e maximizar ROI."
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
            text: "Gerente de Projetos Sênior - Consultoria Empresarial Global"
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
            text: "Janeiro 2019 - Presente"
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
            text: "Assessoria jurídica em operações de fusões e aquisições para empresas de médio e grande porte, com transações superiores a R$ 50 milhões."
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
            text: "Elaboração e negociação de contratos comerciais complexos, incluindo acordos internacionais e joint ventures."
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloIdiomas": {
    id: "idTituloIdiomas",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 10
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
            text: "IDIOMAS",
            bold: true
          }
        ]
      }
    ]
  },
  "idIdiomas": {
    id: "idIdiomas",
    type: "Paragraph",
    meta: {
      align: "left",
      depth: 0,
      order: 11
    },
    value: [
      {
        id: uuidv4(),
        type: "paragraph",
        children: [
          {
            text: "Português (Nativo) • Inglês (Fluente) • Espanhol (Avançado) • Francês (Intermediário)"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idTituloHabilidades": {
    id: "idTituloHabilidades",
    type: "HeadingTwo",
    meta: {
      depth: 0,
      order: 12
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
            text: "HABILIDADES",
            bold: true
          }
        ]
      }
    ]
  },
  "idHabilidade1": {
    id: "idHabilidade1",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 13
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Redação jurídica avançada e preparação de pareceres técnicos"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade2": {
    id: "idHabilidade2",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 14
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Gestão de conflitos e negociação contratual"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  },
  "idHabilidade3": {
    id: "idHabilidade3",
    type: "BulletedList",
    meta: {
      depth: 0,
      order: 15
    },
    value: [
      {
        id: uuidv4(),
        type: "bulleted-list",
        children: [
          {
            text: "Análise de risco e compliance corporativo"
          }
        ],
        props: {
          nodeType: "block"
        }
      }
    ]
  }
};

// Definições dos templates para exportação
export const BASIC_TEMPLATE: ResumeTemplate = {
  id: "basic-template",
  name: "Básico",
  description: "Modelo tradicional completo com destaque para experiência profissional",
  content: BASIC_TEMPLATE_CONTENT,
  hasPhoto: false
};

export const PROFESSIONAL_TEMPLATE: ResumeTemplate = {
  id: "professional-template",
  name: "Profissional",
  description: "Layout executivo ideal para gerentes e profissionais de alto nível",
  content: PROFESSIONAL_TEMPLATE_CONTENT,
  hasPhoto: true
};

export const CREATIVE_TEMPLATE: ResumeTemplate = {
  id: "creative-template",
  name: "Criativo",
  description: "Design expressivo para profissionais de áreas criativas como designers e artistas",
  content: CREATIVE_TEMPLATE_CONTENT,
  hasPhoto: false
};

export const CLASSIC_TEMPLATE: ResumeTemplate = {
  id: "classic-template",
  name: "Clássico",
  description: "Layout tradicional elegante ideal para áreas jurídicas e acadêmicas",
  content: CLASSIC_TEMPLATE_CONTENT,
  hasPhoto: false
};

export const ELEGANT_TEMPLATE: ResumeTemplate = {
  id: "elegant-template",
  name: "Elegante",
  description: "Design sofisticado com barra lateral discreta e perfil destacado",
  content: ELEGANT_TEMPLATE_CONTENT,
  hasPhoto: true
};

export const EXECUTIVE_TEMPLATE: ResumeTemplate = {
  id: "executive-template",
  name: "Executivo",
  description: "Layout profissional com foto e seções bem definidas para liderança",
  content: EXECUTIVE_TEMPLATE_CONTENT,
  hasPhoto: true
};

export const CONTEMPORARY_PHOTO_TEMPLATE: ResumeTemplate = {
  id: "contemporary-photo-template",
  name: "Contemporâneo c/ Foto",
  description: "Design moderno com espaço dedicado para foto de perfil.",
  content: CONTEMPORARY_PHOTO_TEMPLATE_CONTENT,
  hasPhoto: true
}; 