import {atomOneDark, atomOneLight} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {rounded, spacing} from '@/utils/styles';
import CodeHighlighter from 'react-native-code-highlighter';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import React from 'react';
import {View} from 'react-native';

type Props = {
    content: string;
    language?: string;
};

export const CodeRenderer = React.memo(({content, language}: Props) => {
    const theme = useAppTheme();
    return (
        <View style={{borderRadius: rounded.l, overflow: 'hidden'}}>
            <CodeHighlighter
                hljsStyle={theme.isDark ? atomOneDark : atomOneLight}
                textStyle={{fontSize: 15}}
                scrollViewProps={{
                    contentContainerStyle: {padding: spacing.l, flex: 1},
                }}
                language={language || 'JavaScript'}>
                {content}
            </CodeHighlighter>
        </View>
    );
});
