import { faker } from "@faker-js/faker";

export const summary = () => {
    const summaryText = faker.lorem.paragraph(3);

    return (
        `
        <div>
            <h2><strong>Resumo Profissional</strong></h2>
            <p>${summaryText}</p>
        </div>
        `
    )
} 