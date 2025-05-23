import {
    defaultProps,
    BlockNoteEditor,
    DefaultInlineContentSchema,
} from "@blocknote/core";
import { createReactBlockSpec, ReactCustomBlockRenderProps } from "@blocknote/react";
import React, { CSSProperties } from "react";
import { TextSchema } from "../menus/text-color";


type AppInlineContentSchema = DefaultInlineContentSchema;
type AppStyleSchema = typeof TextSchema.styleSchema;

// Renomeado para refletir que customiza o bulletListItem padrão
type CustomBulletListItemBlockConfig = {
    type: "bulletListItem"; // MUITO IMPORTANTE: Define o tipo para substituir o padrão
    propSchema: typeof defaultProps;
    content: "inline";
};

interface CustomCSS extends CSSProperties {
    "--bullet-list-item-color"?: string; // Mantém o nome da variável CSS, ou pode ser --bullet-list-item-color
}

// Renomeado para refletir que é uma customização do bulletListItem padrão
export const CustomBulletListItem = createReactBlockSpec(
    {
        type: "bulletListItem", // MUITO IMPORTANTE: Define o tipo para substituir o padrão
        propSchema: defaultProps,
        content: "inline",
    } as CustomBulletListItemBlockConfig,
    {
        render: (props: ReactCustomBlockRenderProps<
            CustomBulletListItemBlockConfig,
            AppInlineContentSchema,
            AppStyleSchema
        >) => {
            let bulletColor: string | undefined = undefined;

            for (const contentItem of props.block.content) {
                if (contentItem.type === "text" && contentItem.styles.color) {
                    bulletColor = contentItem.styles.color as string;
                    break;
                }
            }

            const liStyle: CustomCSS = {};
            if (bulletColor) {
                // Usando um nome de variável CSS mais genérico se este substitui o padrão
                liStyle["--bullet-list-item-color"] = bulletColor;
            }

            return (
                // O data-content-type será automaticamente "bulletListItem" devido ao tipo do bloco
                <li 
                style={liStyle} 
                data-content-type="bulletListItem" 
                className="flex flex-row items-center bn-list-item relative"
                >
                    <div className="bn-inline-content ml-4" ref={props.contentRef} />
                </li>
            );
        },
    }
);

// A definição de ListBulletItemSchema (BlockNoteSchema.create) deve ser removida deste arquivo,
// pois o schema principal é montado em Editor.tsx.