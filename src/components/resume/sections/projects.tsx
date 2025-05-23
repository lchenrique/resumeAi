import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from 'uuid';

export const projects = () => {
    const projectsData = Array.from({ length: 2 }, () => ({
        id: uuidv4(),
        name: faker.commerce.productName(),
        description: faker.lorem.sentences(2),
        technologies: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => faker.company.buzzNoun()),
        url: faker.internet.url(),
        repositoryUrl: `https://github.com/${faker.internet.userName().toLowerCase()}/${faker.lorem.slug()}`,
    }));

    return (
        `
        <div>
            <h2><strong>Projetos</strong></h2>
            ${projectsData.map(proj => `
                <div key="${proj.id}" style="margin-bottom: 15px;">
                    <h3><strong>${proj.name}</strong></h3>
                    <p>${proj.description}</p>
                    <p><strong>Tecnologias:</strong> ${proj.technologies.join(', ')}</p>
                    <p>
                        ${proj.url ? `<a href="${proj.url}" target="_blank" rel="noopener noreferrer">Deploy</a>` : ''}
                        ${proj.url && proj.repositoryUrl ? ' | ' : ''}
                        ${proj.repositoryUrl ? `<a href="${proj.repositoryUrl}" target="_blank" rel="noopener noreferrer">Repositório</a>` : ''}
                    </p>
                </div>
            `).join('')}
        </div>
        `
    );
} 