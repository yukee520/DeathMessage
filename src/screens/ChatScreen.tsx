import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import type { GameMessage, Clue } from '@/types/game';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { useChatSession } from '@/hooks/useChatSession';
import { LoadingView, ErrorView } from '@/components/StateViews';
import HeaderBar from '@/components/HeaderBar';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import ClueCard from '@/components/ClueCard';
import ChoiceButton from '@/components/ChoiceButton';
import ChatInputBar from '@/components/ChatInputBar';
import AppButton from '@/components/AppButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { caseId } = route.params;

  const pkgQuery = useCaseDetail(caseId);
  const session = useChatSession(pkgQuery.data, route.params.chapterId);
  const listRef = useRef<FlatList<GameMessage>>(null);

  const cluesById = useMemo<Record<string, Clue>>(() => {
    const map: Record<string, Clue> = {};
    for (const c of pkgQuery.data?.clues ?? []) {
      map[c.id] = c;
    }
    return map;
  }, [pkgQuery.data]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timeout);
  }, [session.visibleMessages.length, session.isTyping]);

  const handleSubmitChoice = useCallback(
    (choiceId: string): void => {
      const choice = session.availableChoices.find((c) => c.id === choiceId);
      if (!choice) return;

      if (choice.endingId) {
        navigation.navigate('Ending', { caseId, endingId: choice.endingId });
        return;
      }
      session.submitChoice(choice);
    },
    [session, navigation, caseId],
  );

  const handleFreeText = useCallback(
    async (text: string): Promise<void> => {
      await session.submitFreeText(text);
    },
    [session],
  );

  const handleOpenSuspects = useCallback((): void => {
    navigation.navigate('Suspects', { caseId });
  }, [navigation, caseId]);

  if (pkgQuery.isLoading) {
    return <LoadingView message="正在打开对话…" />;
  }

  if (pkgQuery.isError || !pkgQuery.data) {
    return (
      <ErrorView
        title="无法打开此案件"
        message={pkgQuery.error?.message ?? '案件数据不可用。'}
        onRetry={() => pkgQuery.refetch()}
      />
    );
  }

  const chapter = session.chapter;
  const allowFreeInput = chapter?.allowFreeInput === true;
  const showChoices = session.availableChoices.length > 0 && !session.isTyping;

  const headerRight = (
    <AppButton
      label="嫌疑人"
      icon="people-outline"
      variant="secondary"
      onPress={handleOpenSuspects}
    />
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background dark:bg-dark-background"
      edges={['top']}
    >
      <HeaderBar
        title={chapter?.title ?? '对话'}
        subtitle={pkgQuery.data.title}
        showBack
        right={headerRight}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={session.visibleMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => {
            if (item.type === 'clue' && item.clueId) {
              const clue = cluesById[item.clueId];
              if (clue) return <ClueCard clue={clue} />;
            }
            const sender = chapter?.suspects.find((s) => s.id === item.senderId);
            return (
              <MessageBubble
                message={item}
                senderName={sender?.name ?? item.senderName}
              />
            );
          }}
          ListFooterComponent={
            <View>
              <TypingIndicator visible={session.isTyping} />

              {showChoices ? (
                <View className="mt-4">
                  <Text className="mb-1 ml-1 text-xs font-bold uppercase tracking-wider text-muted dark:text-dark-muted">
                    你的回复
                  </Text>
                  {session.availableChoices.map((choice) => (
                    <ChoiceButton
                      key={choice.id}
                      choice={choice}
                      onPress={(c) => handleSubmitChoice(c.id)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          }
        />

        {allowFreeInput && !session.isTyping ? (
          <ChatInputBar
            onSend={handleFreeText}
            disabled={session.isAwaitingLLM}
            placeholder="对 Ta 说话…"
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}