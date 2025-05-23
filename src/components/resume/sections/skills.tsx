import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from 'uuid';

export const skills = () => {
    const skillCategories = Array.from({ length: 3 }, () => ({
        id: uuidv4(),
        categoryName: faker.commerce.department(),
        skills: Array.from({ length: 6 }, () => faker.lorem.word()),
    }));

    return (
        `
        <div>
            <h2><strong>Habilidades</strong></h2>
            ${skillCategories.map(category => `
                <div key="${category.id}" style="margin-bottom: 10px;">
                    <h4><strong>${category.categoryName}</strong></h4>
                    <p>${category.skills.join(', ')}</p>
                </div>
            `).join('')}
        </div>
        `
    );
} 