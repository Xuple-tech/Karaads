import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/app-theme';
import { useKwatiMessages, useSendKwatiMessage } from '@/features/kwati-ai/hooks';
import type { KwatiChatMessage } from '@/features/kwati-ai/service';
import { router } from '@/lib/navigation/router';

export default function KwatiAiScreen() {
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');
  const messagesQuery = useKwatiMessages();
  const sendMessage = useSendKwatiMessage();
  const messages = useMemo<KwatiChatMessage[]>(() => {
    const stored = messagesQuery.data ?? [];
    if (stored.length) return stored;
    return [
      {
        id: 'kwati-welcome',
        role: 'assistant',
        content: "I'm Kwati AI. I can help you write ads, shape content ideas, and plan smarter campaigns inside Karaads.",
        created_at: new Date(0).toISOString(),
        status: 'sent',
      },
    ];
  }, [messagesQuery.data]);
  const onSend = () => {
    const content = prompt.trim();
    if (!content || sendMessage.isPending) return;
    setPrompt('');
    sendMessage.mutate(content);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <LinearGradient colors={['rgba(0,216,255,0.18)', 'rgba(18,17,45,0.92)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={21} stroke={AppColors.white} />
        </Pressable>
        <View style={styles.titleWrap}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>LIVE ASSISTANT</Text>
          </View>
          <Text style={styles.title}>Kwati AI</Text>
          <Text style={styles.subtitle}>Creative Assistant</Text>
        </View>
        <View style={styles.logo}>
          <FontAwesome6 name="fingerprint" size={29} color={AppColors.white} />
          <Text style={styles.logoK}>k</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(0,216,255,0.16)', 'rgba(255,255,255,0.035)']} style={styles.askCard}>
          <Text style={styles.askTitle}>Ask Kwati AI anything</Text>
          <Text style={styles.askCopy}>Get help with ad copy, promotion strategy, content ideas, and campaign structure.</Text>
          {['Write a catchy ad caption for my product', 'Give me 5 viral content ideas for Karaads', 'Help me plan a campaign for this week'].map((item) => (
            <Pressable key={item} style={styles.promptPill} onPress={() => setPrompt(item)}>
              <Text style={styles.promptPillText}>{item}</Text>
            </Pressable>
          ))}
        </LinearGradient>

        {messagesQuery.isError ? <Text style={styles.chatError}>Unable to load saved Kwati AI chat.</Text> : null}
        {messages.map((message) => (
          <KwatiMessageRow key={message.id} message={message} />
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Message Kwati AI..."
          placeholderTextColor="rgba(255,255,255,0.40)"
          style={styles.input}
          multiline
          maxLength={800}
        />
        <Pressable style={[styles.sendBtn, sendMessage.isPending ? styles.sendBtnDisabled : null]} onPress={onSend} disabled={sendMessage.isPending}>
          <Send size={21} stroke={AppColors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const KwatiMessageRow = ({ message }: { message: KwatiChatMessage }) => {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageRow, isUser ? styles.userMessageRow : null]}>
      {!isUser ? (
        <View style={styles.messageLogo}>
          <FontAwesome6 name="fingerprint" size={22} color={AppColors.white} />
          <Text style={styles.messageLogoK}>k</Text>
        </View>
      ) : null}
      <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : null]}>
        <Text style={styles.messageText}>{message.content}</Text>
        {message.status && message.status !== 'sent' ? <Text style={styles.messageStatus}>{message.status}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A1220' },
  header: {
    minHeight: 88,
    marginHorizontal: 14,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,216,255,0.24)',
    overflow: 'hidden',
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.09)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  titleWrap: { alignItems: 'center', gap: 4, flex: 1 },
  statusPill: { minHeight: 20, borderRadius: 10, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,216,255,0.13)', borderWidth: 1, borderColor: 'rgba(0,216,255,0.24)' },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#35F6FF' },
  statusText: { color: 'rgba(255,255,255,0.72)', fontSize: 8, fontFamily: undefined, fontWeight: '800' },
  title: { color: AppColors.white, fontSize: 18, fontFamily: undefined, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.60)', fontSize: 10, fontFamily: undefined, fontWeight: '700' },
  logo: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,216,255,0.22)', borderWidth: 1, borderColor: 'rgba(139,244,255,0.44)' },
  logoK: { position: 'absolute', bottom: 5, color: AppColors.white, fontSize: 10, fontFamily: undefined, fontWeight: '800' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 22, gap: 14 },
  askCard: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(0,216,255,0.22)', padding: 16, gap: 10, overflow: 'hidden' },
  askTitle: { color: AppColors.white, fontSize: 15, lineHeight: 20, fontFamily: undefined, fontWeight: '800' },
  askCopy: { color: 'rgba(255,255,255,0.66)', fontSize: 13, lineHeight: 20, fontFamily: undefined, fontWeight: '400' },
  promptPill: { minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 8 },
  promptPillText: { color: 'rgba(255,255,255,0.88)', textAlign: 'center', fontSize: 12, lineHeight: 16, fontFamily: undefined, fontWeight: '800' },
  messageRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userMessageRow: { justifyContent: 'flex-end' },
  messageLogo: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,216,255,0.18)', borderWidth: 1, borderColor: 'rgba(0,216,255,0.35)' },
  messageLogoK: { position: 'absolute', bottom: 4, color: AppColors.white, fontSize: 8, fontFamily: undefined, fontWeight: '800' },
  messageBubble: { maxWidth: '84%', borderRadius: 20, borderBottomLeftRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 11 },
  userMessageBubble: { maxWidth: '80%', borderBottomLeftRadius: 20, borderBottomRightRadius: 8, backgroundColor: 'rgba(0,216,255,0.20)', borderColor: 'rgba(0,216,255,0.26)' },
  messageText: { color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 20, fontFamily: undefined, fontWeight: '400' },
  messageStatus: { marginTop: 6, color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: undefined, fontWeight: '700' },
  chatError: { color: '#FCA5A5', fontSize: 12, textAlign: 'center', fontFamily: undefined, fontWeight: '700' },
  inputBar: { minHeight: 84, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.10)', paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 10, backgroundColor: 'rgba(15,16,32,0.96)' },
  input: { flex: 1, minHeight: 46, maxHeight: 112, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)', backgroundColor: 'rgba(255,255,255,0.06)', color: AppColors.white, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 14, lineHeight: 19, fontFamily: undefined, fontWeight: '600' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,216,255,0.30)' },
  sendBtnDisabled: { opacity: 0.55 },
});
