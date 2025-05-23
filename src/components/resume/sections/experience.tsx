import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from 'uuid';

export const experience = () => {
    const experiences = Array.from({ length: 2 }, () => ({
        id: uuidv4(),
        company: faker.company.name(),
        title: faker.person.jobTitle(),
        startDate: `${faker.date.month()} ${faker.date.past({ years: 5 }).getFullYear()}`,
        endDate: faker.datatype.boolean() ? 'Presente' : `${faker.date.month()} ${faker.date.past({ years: 2 }).getFullYear()}`,
        location: `${faker.location.city()}, ${faker.location.state()}`,
        description: `- ${faker.lorem.lines(2)}\n- ${faker.lorem.lines(2)}`,
    }));

    return (
        `
        <div>
            <h2><strong>Experiência Profissional</strong></h2>
            ${experiences.map(exp => `
                <div key="${exp.id}" style="margin-bottom: 15px;">
                    <h3><strong>${exp.title}</strong> em <strong>${exp.company}</strong></h3>
                    <p><em>${exp.startDate} - ${exp.endDate} | ${exp.location}</em></p>
                    <div style="white-space: pre-wrap; font-family: inherit;">${exp.description}</div>
                </div>
            `).join('')}
        </div>
        `
    );
} 