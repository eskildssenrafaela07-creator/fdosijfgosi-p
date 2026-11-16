// @ts-nocheck
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STAGE_EXPLORATION_SECTORS,
  buildSideQuestViewList,
  computeRoomSectorIndex,
  computeStageExplorationPct,
  generateChapterSideQuests,
  incrementSideQuestMap,
} from './sideQuests';

test('side quests generate 4 distinct quests per surface and underworld chapter', () => {
  for (let ch = 0; ch < 50; ch++) {
    const sq = generateChapterSideQuests(ch, false, `Fase ${ch + 1} · Teste`);
    assert.equal(sq.length, 4);
    const ids = new Set(sq.map((q) => q.id));
    assert.equal(ids.size, 4);
    for (const q of sq) {
      assert.ok(q.target >= 2);
      assert.ok(q.coinReward >= 10);
      assert.ok(q.playerXpReward >= 50);
    }
  }
  for (let uw = 0; uw < 20; uw++) {
    const sq = generateChapterSideQuests(uw, true, `Círculo ${uw + 1}`);
    assert.equal(sq.length, 4);
  }
});

test('incrementSideQuestMap caps progress at target and signals completion once', () => {
  const progressMap: Record<string, number> = {};
  const first = incrementSideQuestMap(progressMap, 0, false, 'secret_vaults', 1);
  assert.equal(first.newProgress, 1);
  assert.equal(first.justCompleted, false);

  const second = incrementSideQuestMap(progressMap, 0, false, 'secret_vaults', 1);
  assert.equal(second.newProgress, 2);
  assert.equal(second.justCompleted, false);

  const third = incrementSideQuestMap(progressMap, 0, false, 'secret_vaults', 1);
  assert.equal(third.newProgress, 3);
  assert.equal(third.justCompleted, true);

  const fourth = incrementSideQuestMap(progressMap, 0, false, 'secret_vaults', 1);
  assert.equal(fourth.newProgress, 3);
  assert.equal(fourth.justCompleted, false);

  const views = buildSideQuestViewList(0, false, 'Fase 1', progressMap, new Set([third.questId]));
  const vaultView = views.find((v) => v.kind === 'secret_vaults');
  assert.ok(vaultView);
  assert.equal(vaultView.completed, true);
  assert.equal(vaultView.claimed, true);
});

test('stage exploration sector mapping spans 0..N-1 cleanly and reaches 100%', () => {
  const roomPx = 180 * 8;
  const visited: number[] = [];
  for (let i = 0; i < STAGE_EXPLORATION_SECTORS; i++) {
    const cx = ((i + 0.5) / STAGE_EXPLORATION_SECTORS) * roomPx;
    const sec = computeRoomSectorIndex(cx, roomPx);
    assert.equal(sec, i);
    visited.push(sec);
  }
  assert.equal(computeStageExplorationPct(visited), 100);
  assert.equal(computeStageExplorationPct([0, 1, 2]), 50);
});
