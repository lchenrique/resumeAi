import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from 'uuid';

export const references = () => {
    const referencesData = Array.from({ length: 2 }, () => ({
        id: uuidv4(),
        name: faker.person.fullName(),
        title: faker.person.jobTitle(),
        company: faker.company.name(),
        contactInfo: faker.datatype.boolean() ? faker.phone.number() : faker.internet.email(),
    }));

    return (
        `
        <div>
            <h2><strong>Referências</strong></h2>
            ${referencesData.map(ref => `
                <div key="${ref.id}" style="margin-bottom: 10px;">
                    <p><strong>${ref.name}</strong> - ${ref.title} em ${ref.company}</p>
                    <p>Contato: ${ref.contactInfo}</p>
                </div>
            `).join('')}
            <p><em>Referências adicionais disponíveis sob solicitação.</em></p>
        </div>
        `
    );
} 