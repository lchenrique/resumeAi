import { v4 as uuidv4 } from 'uuid';
import { YooptaContentValue, createDivider } from '../utils';

// Template Moderno com Barra Lateral
// OBS: A divisão visual em colunas é controlada por CSS específico para este template.
// A ordem dos blocos aqui representa a ordem linear no editor.
export const MODERN_SIDEBAR_TEMPLATE_CONTENT: YooptaContentValue = {
  "idHeader": {
      "id": "idHeader",
      "type": "HeadingOne",
      "meta": {
          "depth": 0,
          "order": 0
      },
      "value": [
          {
              "id": "4b0cb4f8-95aa-4019-8fcc-664183f3282e",
              "type": "heading-one",
              "props": {
                  "nodeType": "block"
              },
              "children": [
                  {
                      "text": "João da Silva",
                      "bold": true,
                      "highlight": {
                          "color": "#1a0070"
                      }
                  }
              ]
          }
      ]
  },
  "idProfissao": {
      "id": "idProfissao",
      "type": "Paragraph",
      "meta": {
          "align": "left",
          "depth": 0,
          "order": 1
      },
      "value": [
          {
              "id": "618f75fe-5efb-456e-8ae1-c79a68f3aae3",
              "type": "paragraph",
              "children": [
                  {
                      "text": "Desenvolvedor Full Stack | React | Node.js | TypeScript",
                      "italic": true,
                      "highlight": {
                          "color": "#787774"
                      }
                  }
              ],
              "props": {
                  "nodeType": "block"
              }
          }
      ]
  },
  "idContato": {
      "id": "idContato",
      "type": "Paragraph",
      "meta": {
          "align": "left",
          "depth": 0,
          "order": 2
      },
      "value": [
          {
              "id": "7e8d2a71-9439-4cd2-89e9-88aa66f5cb8f",
              "type": "paragraph",
              "children": [
                  {
                      "text": "São Paulo, SP • (11) 98765-4321 • joao@email.com • linkedin.com/in/joaodasilva",
                      "highlight": {
                          "color": "#787774"
                      }
                  }
              ],
              "props": {
                  "nodeType": "block"
              }
          }
      ]
  },
  "idTituloResumo": {
      "id": "idTituloResumo",
      "type": "HeadingTwo",
      "meta": {
          "depth": 0,
          "order": 3
      },
      "value": [
          {
              "id": "1c94c78d-c52f-478f-8e6d-19b4d174c3a4",
              "type": "heading-two",
              "props": {
                  "nodeType": "block"
              },
              "children": [
                  {
                      "text": "Resumo Profissional",
                      "bold": true,
                      "highlight": {
                          "color": "#1a0070"
                      }
                  }
              ]
          }
      ]
  },
  "idDivider3.1": {
      "id": "idDivider3.1",
      "type": "Divider",
      "meta": {
          "depth": 0,
          "order": 3.1
      },
      "value": [
          {
              "id": "29afd293-91bd-4dcc-9f49-f48ef6f1bb93",
              "type": "divider",
              "children": [
                  {
                      "text": ""
                  }
              ],
              "props": {
                  "nodeType": "block",
                  theme: "gradient"
              }
          }
      ]
  },
  "idResumo": {
      "id": "idResumo",
      "type": "Paragraph",
      "meta": {
          "align": "left",
          "depth": 0,
          "order": 4
      },
      "value": [
          {
              "id": "7fe82fed-2c8a-44d5-ba6b-b7c59cbbf52c",
              "type": "paragraph",
              "children": [
                  {
                      "text": "Desenvolvedor Full Stack com 5 anos de experiência em criar aplicações web responsivas e intuitivas. Especializado em React, Node.js e TypeScript, com sólidos conhecimentos em arquitetura de software e práticas de desenvolvimento ágil."
                  }
              ],
              "props": {
                  "nodeType": "block"
              }
          }
      ]
  },
  "idTituloExperiencia": {
      "id": "idTituloExperiencia",
      "type": "HeadingTwo",
      "meta": {
          "depth": 0,
          "order": 5
      },
      "value": [
          {
              "id": "6b83da67-ac8f-4a17-8601-3c3c9bd3bf7f",
              "type": "heading-two",
              "props": {
                  "nodeType": "block"
              },
              "children": [
                  {
                      "text": "Experiência Profissional",
                      "bold": true,
                      "highlight": {
                          "color": "#1a0070"
                      }
                  }
              ]
          }
      ]
  },
  "idDivider5.1": {
      "id": "idDivider5.1",
      "type": "Divider",
      "meta": {
          "depth": 0,
          "order": 5.1
      },
      "value": [
          {
              "id": "5ffa8142-c559-4b4c-abdd-4126b414bd6a",
              "type": "divider",
              "children": [
                  {
                      "text": ""
                  }
              ],
              "props": {
                  "nodeType": "block",
                  "theme": "gradient"
              }
          }
      ]
  },
  "idEmpresa1": {
      "id": "idEmpresa1",
      "type": "HeadingThree",
      "meta": {
          "depth": 0,
          "order": 6
      },
      "value": [
          {
              "id": "c4b3ab94-be43-4499-87b1-7a340ca64170",
              "type": "heading-three",
              "props": {
                  "nodeType": "block"
              },
              "children": [
                  {
                      "text": "Desenvolvedor Full Stack Senior - Empresa XYZ",
                      "highlight": {
                          "color": "#00095f"
                      }
                  }
              ]
          }
      ]
  },
  "idPeriodo1": {
      "id": "idPeriodo1",
      "type": "Paragraph",
      "meta": {
          "align": "left",
          "depth": 0,
          "order": 7
      },
      "value": [
          {
              "id": "5e78a86c-ccaa-4fb4-bf3d-a4270bfba8ae",
              "type": "paragraph",
              "children": [
                  {
                      "text": "Março 2020 - Presente"
                  }
              ],
              "props": {
                  "nodeType": "block"
              }
          }
      ]
  },
  "idRealizacao1": {
      "id": "idRealizacao1",
      "type": "BulletedList",
      "meta": {
          "depth": 0,
          "order": 8
      },
      "value": [
          {
              "id": "220f81d5-0b88-41f2-a5cd-0b38ce370e56",
              "type": "bulleted-list",
              "children": [
                  {
                      "text": "Liderou o desenvolvimento de um dashboard de analytics utilizado por mais de 500 clientes corporativos"
                  }
              ],
              "props": {
                  "nodeType": "block"
              }
          }
      ]
  },
  "idRealizacao2": {
      "id": "idRealizacao2",
      "type": "BulletedList",
      "meta": {
          "depth": 0,
          "order": 9
      },
      "value": [
          {
              "id": "e7aa653b-a9e4-42e1-9d86-f15ac24c303e",
              "type": "bulleted-list",
              "children": [
                  {
                      "text": "Implementou uma arquitetura de microserviços que melhorou o tempo de carregamento em 40%"
                  }
              ],
              "props": {
                  "nodeType": "block"
              }
          }
      ]
  },
  "idRealizacao3": {
      "id": "idRealizacao3",
      "type": "BulletedList",
      "meta": {
          "depth": 0,
          "order": 10
      },
      "value": [
          {
              "id": "24448b7a-393d-467d-9e4e-cb88d92cd510",
              "type": "bulleted-list",
              "children": [
                  {
                      "text": "Mentoria de desenvolvedores júnior e revisão de código para garantir qualidade e práticas recomendadas"
                  }
              ],
              "props": {
                  "nodeType": "block"
              }
          }
      ]
  }
}