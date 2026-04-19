const lastUpdated = "2026-04-20"; // 手動で更新時に書き換える

/**
 * 【講義データ定義・編集ガイド】
 * * 1. 構造について
 * - coreCourses: 全コース共通の科目データ（配列）
 * - majorMasters: 各専攻(1,2,3)ごとの「専門(adv)」および「関連(rel)」科目データ
 * * 2. プロパティ定義
 * - name (string)        : 講義名
 * - schedule (string)    : 画面表示用のスケジュール文字列（例: "前期月2"）
 * - sem (string)         : 学期フラグ（前期: "z" / 後期: "k"）
 * - day (number)         : 曜日数値（月: 1, 火: 2, 水: 3, 木: 4, 金: 5）
 * - period (number)      : 時限数値（1 ～ 5）
 * - isIntensive (bool)   : 集中講義の場合 true（day/period不要）
 * - isOther (bool)       : その他（共同研究等）の場合 true
 * * 3. 編集の注意
 * - 曜日や時限が「開講なし」の場合は、nameとscheduleのみを記述してください。
 * - カンマ(,)の欠落や、中括弧{}の閉じ忘れにご注意ください。
 */

// 共通科目データ
const coreCourses = [
    { name: "離散数学特論", schedule: "開講なし" },
    { name: "システム設計・評価特論", schedule: "前期金3", sem: "z", day: 5, period: 3 },
    { name: "分散協調アルゴリズム特論", schedule: "前期月2", sem: "z", day: 1, period: 2 },
    { name: "知的通信システム特論", schedule: "後期月4", sem: "k", day: 1, period: 4 },
    { name: "計算機アーキテクチャ特論", schedule: "開講なし" },
    { name: "ソフトウェア工学特論", schedule: "前期木3", sem: "z", day: 4, period: 3 },
    { name: "共同研究プロジェクト", schedule: "前期その他", sem: "z", isOther: true }
];

// 各専攻の専門・関連科目データ
const majorMasters = {
    "1": { 
        adv: [
            { name: "数値線形代数特論", schedule: "後期火2", sem: "k", day: 2, period: 2 },
            { name: "ソフトウェアアーキテクチャ", schedule: "後期火4", sem: "k", day: 2, period: 4 },
            { name: "正当性検証と妥当性確認", schedule: "後期月2", sem: "k", day: 1, period: 2 },
            { name: "確率統計解析特論", schedule: "開講なし" },
            { name: "通信システム構成特論", schedule: "後期月3", sem: "k", day: 1, period: 3 },
            { name: "ネットワークシステム特論", schedule: "前期水1", sem: "z", day: 3, period: 1 },
            { name: "ネットワークセキュリティ特論", schedule: "前期火3", sem: "z", day: 2, period: 3 },
            { name: "ソフトウェア工学実践", schedule: "後期その他", sem: "k", isOther: true },
            { name: "機械学習特論", schedule: "後期金3", sem: "k", day: 5, period: 3 }
        ], 
        rel: [
            { name: "情報システム特論", schedule: "前期集中", sem: "z", isIntensive: true },
            { name: "メディア情報特論", schedule: "後期水2", sem: "k", day: 3, period: 2 },
            { name: "システム科学特論", schedule: "後期木3", sem: "k", day: 4, period: 3 },
            { name: "情報科学特論", schedule: "前期月4", sem: "z", day: 1, period: 4 },
            { name: "知的情報メディア特論", schedule: "前期月3", sem: "z", day: 1, period: 3 },
            { name: "モデルベース制御特論", schedule: "後期木1", sem: "k", day: 4, period: 1 },
            { name: "組込みソフトウェア特論", schedule: "前期木5", sem: "z", day: 4, period: 5 }
        ]
    },
    "2": { 
        adv: [
            { name: "生体センシング特論", schedule: "開講なし" },
            { name: "視覚情報特論", schedule: "前期火4", sem: "z", day: 2, period: 4 },
            { name: "音響情報特論", schedule: "前期火2", sem: "z", day: 2, period: 2 },
            { name: "認知情報特論", schedule: "後期火1", sem: "k", day: 2, period: 1 },
            { name: "離散事象システム特論", schedule: "前期金2", sem: "z", day: 5, period: 2 },
            { name: "情報教育システム特論", schedule: "前期木2", sem: "z", day: 4, period: 2 }
        ], 
        rel: [
            { name: "情報システム特論", schedule: "前期集中", sem: "z", isIntensive: true },
            { name: "メディア情報特論", schedule: "後期水2", sem: "k", day: 3, period: 2 },
            { name: "システム科学特論", schedule: "後期木3", sem: "k", day: 4, period: 3 },
            { name: "情報科学特論", schedule: "前期月4", sem: "z", day: 1, period: 4 },
            { name: "高信頼情報システム特論", schedule: "前期集中", sem: "z", isIntensive: true },
            { name: "地域情報システム特論", schedule: "前期金4", sem: "z", day: 5, period: 4 },
            { name: "知的情報メディア特論", schedule: "前期月3", sem: "z", day: 1, period: 3 }
        ]
    },
    "3": { 
        adv: [
            { name: "複雑系シミュレーション特論", schedule: "後期金4", sem: "k", day: 5, period: 4 },
            { name: "神経情報特論", schedule: "後期金1", sem: "k", day: 5, period: 1 },
            { name: "医用情報特論", schedule: "後期火2", sem: "k", day: 2, period: 2 },
            { name: "応用数値解析特論", schedule: "前期木2", sem: "z", day: 4, period: 2 },
            { name: "組込みシステム特論", schedule: "後期木2", sem: "k", day: 4, period: 2 },
            { name: "地域環境解析特論", schedule: "後期火1", sem: "k", day: 2, period: 1 },
            { name: "生体機能特論", schedule: "前期火3", sem: "z", day: 2, period: 3 }
        ], 
        rel: [
            { name: "情報システム特論", schedule: "前期集中", sem: "z", isIntensive: true },
            { name: "メディア情報特論", schedule: "後期水2", sem: "k", day: 3, period: 2 },
            { name: "システム科学特論", schedule: "後期木3", sem: "k", day: 4, period: 3 },
            { name: "情報科学特論", schedule: "前期月4", sem: "z", day: 1, period: 4 },
            { name: "高信頼情報システム特論", schedule: "前期集中", sem: "z", isIntensive: true },
            { name: "地域情報システム特論", schedule: "前期金4", sem: "z", day: 5, period: 4 },
            { name: "モデルベース制御特論", schedule: "後期木1", sem: "k", day: 4, period: 1 },
            { name: "組込みソフトウェア特論", schedule: "前期木5", sem: "z", day: 4, period: 5 }
        ]
    }
};