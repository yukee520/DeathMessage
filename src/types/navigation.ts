import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Cases: undefined;
  Clues: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  CaseDetail: { caseId: string };
  Chat: { caseId: string; chapterId?: string };
  Suspects: { caseId: string };
  Ending: { caseId: string; endingId: string };
  Settings: undefined;
  Downloads: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}