import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from 'uuid';

export const education = () => {
    const educations = Array.from({ length: 2 }, () => ({
        id: uuidv4(),
        institution: `${faker.company.name()} University`,
        degree: faker.person.jobType(),
        fieldOfStudy: faker.person.jobArea(),
        startDate: `${faker.date.month()} ${faker.date.past({ years: 8 }).getFullYear()}`,
        endDate: `${faker.date.month()} ${faker.date.past({ years: 4 }).getFullYear()}`,
        description: faker.lorem.sentence(),
    }));

    return (
        `
        <div>
            <h2><strong>Formação Acadêmica</strong></h2>
            ${educations.map(edu => `
                <div key="${edu.id}" style="margin-bottom: 15px;">
                    <h3><strong>${edu.degree} em ${edu.fieldOfStudy}</strong></h3>
                    <p><em>${edu.institution}</em></p>
                    <p><em>${edu.startDate} - ${edu.endDate}</em></p>
                    <p>${edu.description}</p>
                </div>
            `).join('')}
        </div>
        `
    );
} 