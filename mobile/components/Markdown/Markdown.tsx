import {StyleSheet} from 'react-native';
import Markdown, {ASTNode, MarkdownIt} from 'react-native-markdown-display';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import {ReactNode} from 'react';
import Image from '@/components/Image/Image';
import {CodeRenderer} from '@/components/Markdown/CodeRenderer';

type Props = {
    markdown?: string;
    children?: ReactNode | undefined;
};

const rules = {
    image: (
        node: ASTNode,
        children: ReactNode[],
        parentNodes: ASTNode[],
        styles: any,
        allowedImageHandlers: string[],
        defaultImageHandler: string,
    ) => {
        return <Image key={node.key} style={styles.image} uri={node.attributes.src} contentFit={'contain'} />;
    },
    fence: (node: ASTNode) => {
        //@ts-expect-error sourceInfo exists if you log
        return <CodeRenderer key={node.key} content={node.content} language={node.sourceInfo} />;
    },
    code: (node: ASTNode) => {
        //@ts-expect-error sourceInfo exists if you log
        return <CodeRenderer key={node.key} content={node.content} language={node.sourceInfo} />;
    },
    code_block: (node: ASTNode) => {
        //@ts-expect-error sourceInfo exists if you log
        return <CodeRenderer key={node.key} content={node.content} language={node.sourceInfo} />;
    },
};

export default function (props: Props) {
    const theme = useAppTheme();
    const styles = dynamicStyles(theme);
    const onLinkPress = (url: string): boolean => {
        //TODO
        return true;
    };

    return (
        <Markdown style={styles} onLinkPress={onLinkPress} rules={rules}>
            {props.children || ''}
        </Markdown>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        body: {
            color: theme.colors.textPrimary,
        },
        heading1: {
            fontSize: 32,
            fontFamily: 'Font-800',
        },
        heading2: {
            fontSize: 24,
            fontFamily: 'Font-700',
        },
        heading3: {
            fontSize: 18,
            fontFamily: 'Font-600',
        },
        heading4: {
            fontSize: 16,
            fontFamily: 'Font-600',
        },
        heading5: {
            fontSize: 13,
            fontFamily: 'Font-600',
        },
        heading6: {
            fontSize: 11,
            fontFamily: 'Font-600',
        },
        hr: {
            backgroundColor: theme.colors.border,
            height: 1,
        },
        link: {
            color: palette.teal500,
        },
        blockquote: {
            backgroundColor: theme.isDark ? palette.dark700 : palette.neutral100,
            borderLeftColor: theme.colors.textTertiary,
            borderLeftWidth: spacing.xs,
            paddingHorizontal: spacing.l,
            paddingVertical: spacing.m,
        },
        code_inline: {
            backgroundColor: theme.isDark ? palette.dark700 : palette.neutral50,
            fontFamily: 'Font-500',
        },
        code_block: {
            backgroundColor: theme.isDark ? palette.dark700 : palette.neutral50,
        },
        table: {
            borderColor: theme.colors.border,
            borderWidth: 1,
        },
        thead: {
            backgroundColor: theme.colors.cardBackground,
            color: theme.colors.textPrimary,
            fontFamily: 'Font-600',
            padding: spacing.xs,
            borderBottomWidth: 0,
        },
        tbody: {
            backgroundColor: theme.colors.cardBackgroundLight,
            color: theme.colors.textPrimary,
        },
        tr: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
            padding: spacing.xs,
        },
        td: {},
        strong: {
            fontFamily: 'Font-700',
        },
        image: {
            borderRadius: rounded.m,
            height: 400,
        },
    });
