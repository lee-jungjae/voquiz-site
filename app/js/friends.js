// Friends: asking by email (the other has to accept), five invite codes each (whoever enters
// one is a friend at once), and the page where the list is looked after.
// Like duel.js, this gets what it needs from app.js through `c`.

export function initFriends(c) {
  const { h, t, state, api } = c;
  let lastFetch = 0;
  // What the page is showing besides the data: a message, the email being typed, a row asking "really?".
  const ui = { notice: null, email: "", code: "", confirm: null, busy: false, sharing: null };

  const who = (other) => c.nameOf(other.nickname, other.tag);
  const all = () => state.friends || [];
  const incoming = () => all().filter((f) => f.status === "incoming");
  const ERRORS = () => ({
    friend_nobody: t("이 이메일로 가입한 친구를 찾지 못했어요."),
    friend_self: t("내 이메일이에요. 친구의 이메일을 넣어 주세요."),
    friend_already: t("이미 친구예요."),
    friend_pending: t("이미 친구 신청을 보냈어요. 수락을 기다리고 있어요."),
    friend_limit: t("보낸 신청이 너무 많아요. 수락을 기다려 주세요."),
    friend_gone: t("이미 처리된 신청이에요."),
    invite_invalid: t("없는 초대 코드예요. 다시 확인해 주세요."),
    invite_used: t("이미 다른 친구가 쓴 초대 코드예요."),
    invite_self: t("내 초대 코드는 내가 쓸 수 없어요."),
    invite_once: t("초대 코드는 한 번만 입력할 수 있어요."),
  });
  const explain = (err) => ERRORS()[err?.code] || t("문제가 생겼어요. 잠시 후 다시 시도해 주세요.");

  // ---------- data ----------

  async function refresh(force) {
    if (!state.user || (!force && Date.now() - lastFetch < 60000)) return;
    lastFetch = Date.now();
    try {
      state.friends = await api.listFriends();
      state.friendSetup = false;
    } catch (err) {
      // The database part (0005_friends.sql) has not been installed yet.
      if (err?.status === 404 || err?.code === "PGRST202") state.friendSetup = true;
      else console.error(err);
      return;
    }
    c.render();
  }

  async function loadInvites() {
    state.invites = null; // loading
    try {
      state.invites = await api.myInvites();
    } catch (err) {
      console.error(err);
      state.invites = [];
    }
    c.render();
  }

  // Runs one change (ask, accept, remove...), says how it went, and reads the list again.
  async function run(action, done) {
    if (ui.busy) return;
    ui.busy = true;
    ui.confirm = null;
    try {
      const result = await action();
      ui.notice = null;
      c.toastText(typeof done === "function" ? done(result) : done);
    } catch (err) {
      console.error(err);
      if (err?.status === 401) { ui.busy = false; await c.fail(err); return c.render(); }
      ui.notice = explain(err);
    }
    ui.busy = false;
    await refresh(true);
    c.render();
  }

  // Asks by email. Used by this page and by the duel screen. Returns a sentence to show.
  async function ask(email) {
    try {
      const status = await api.requestFriend(email);
      await refresh(true);
      return { ok: true, text: status === "accepted" ? t("서로 신청해서 바로 친구가 됐어요!") : t("친구 신청을 보냈어요. 친구가 수락하면 대결할 수 있어요.") };
    } catch (err) {
      console.error(err);
      return { ok: false, text: explain(err) };
    }
  }

  // ---------- notices ----------

  const badge = () => incoming().length;

  function banner() {
    const first = incoming()[0];
    if (!first) return null;
    return h("div", { class: "duel-banners" },
      h("button", { class: "duel-banner friend", onclick: open },
        h("span", { class: "duel-vs", "aria-hidden": "true" }, "+"),
        h("span", { class: "duel-text" },
          h("b", null, t("{name}의 친구 신청이 왔어요", { name: who(first.other) })),
          incoming().length > 1 && h("small", null, t("외 {n}명", { n: incoming().length - 1 }))),
        h("span", { class: "go" }, t("보기"))));
  }

  function open() {
    ui.sharing = null;
    if (state.tab !== "friends") c.openPage("friends");
  }

  // ---------- the page ----------

  // What a friend receives: the code, where to get VOQUIZ, and what to do.
  function inviteText(code) {
    return [
      t("VOQUIZ에서 같이 단어 공부하자!"),
      `${t("초대 코드")}: ${code}`,
      c.storeUrl && `${t("설치")}: ${c.storeUrl}`,
      t("설치하고 Google로 로그인한 다음 초대 코드를 입력하면 돼."),
    ].filter(Boolean).join("\n");
  }
  async function copy(text, done) {
    try {
      await navigator.clipboard.writeText(text);
      c.toastText(done);
    } catch (err) {
      console.error(err);
      c.toastText(t("복사하지 못했어요. 코드를 직접 알려 주세요."));
    }
  }
  const unused = () => (state.invites || []).filter((code) => !code.used);

  // The invitation: one unused code, the download link and the steps, ready to send.
  function inviteView() {
    const codes = unused();
    const code = codes[ui.sharing % Math.max(1, codes.length)]?.code;
    const back = () => { ui.sharing = null; c.render(); };
    const head = h("div", { class: "page-head" },
      h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: back }, "←"),
      h("h2", { class: "page-title" }, t("친구 초대하기")));
    if (!code) return [head, h("div", { class: "notice" }, t("초대장을 모두 썼어요."))];
    const text = inviteText(code);
    return [
      head,
      h("div", { class: "ticket" },
        h("div", { class: "ticket-top" }, c.logoIcon(44), h("div", null, h("b", null, t("VOQUIZ 초대장")), h("small", null, t("{name}이(가) 초대했어요", { name: c.displayName() })))),
        h("div", { class: "ticket-code" }, h("small", null, t("초대 코드")), h("b", null, code)),
        h("ol", { class: "guide-steps" },
          h("li", null, h("span", null, c.storeUrl
            ? [t("아래 링크에서 VOQUIZ를 크롬에 설치해요."), h("a", { class: "ticket-link", href: c.storeUrl, target: "_blank", rel: "noopener" }, c.storeUrl)]
            : t("크롬에 VOQUIZ를 설치해요."))),
          h("li", null, t("Google 계정으로 로그인해요.")),
          h("li", null, t("초대 코드를 입력하면 가입되고, 바로 친구가 돼요."))),
        h("p", { class: "small muted" }, t("이 코드는 한 명만 쓸 수 있어요."))),
      !c.storeUrl && h("p", { class: "small muted center", style: "margin-top:10px" }, t("설치 링크는 크롬 웹 스토어에 등록하면 여기에 자동으로 들어가요.")),
      codes.length > 1 && h("p", { class: "center act-note" },
        h("button", { class: "link", onclick: () => { ui.sharing += 1; c.render(); } }, t("다른 초대 코드 보기"))),
      h("p", { class: "act" },
        h("button", { class: "btn wide", onclick: async () => {
          // The system's own share sheet where there is one; otherwise the message is copied.
          if (navigator.share) {
            try { await navigator.share({ title: "VOQUIZ", text }); return; } catch (err) { if (err?.name === "AbortError") return; }
          }
          copy(text, t("초대 메시지를 복사했어요. 친구에게 붙여 넣어 보내세요!"));
        } }, t("초대 메시지 보내기"))),
      h("p", { class: "center act-note" },
        h("button", { class: "link", onclick: () => copy(code, t("초대 코드를 복사했어요.")) }, t("코드만 복사"))),
    ];
  }

  function view() {
    if (ui.sharing !== null && !state.friendSetup) return inviteView();
    const head = h("div", { class: "page-head" },
      h("button", { class: "back", "aria-label": t("뒤로"), title: t("뒤로"), onclick: () => c.openPage("friends") }, "←"),
      h("h2", { class: "page-title" }, t("친구")));
    if (state.friendSetup) {
      return [head, h("div", { class: "notice" }, t("친구 기능을 쓰려면 Supabase SQL Editor에서 0005_friends.sql을 한 번 실행해야 해요."))];
    }
    refresh(false);
    if (state.invites === undefined) loadInvites();
    const asking = incoming();
    const friends = all().filter((f) => f.status === "accepted");
    const sent = all().filter((f) => f.status === "outgoing");
    const left = unused().length;

    return [
      head,
      ui.notice && h("div", { class: "notice" }, ui.notice),

      asking.length > 0 && h("section", { class: "duel-list" },
        h("h3", null, t("받은 친구 신청"), h("small", null, String(asking.length))),
        asking.map((f) => h("div", { class: "duel-row hot" },
          h("span", { class: "who" }, who(f.other), f.other.grade && h("small", null, `G${f.other.grade}`)),
          h("button", { class: "mini buy", onclick: () => run(() => api.answerFriend(f.id, true), t("{name}와(과) 친구가 됐어요!", { name: who(f.other) })) }, t("수락")),
          h("button", { class: "link", onclick: () => run(() => api.answerFriend(f.id, false), t("신청을 거절했어요.")) }, t("거절"))))),

      h("section", { class: "duel-list" },
        h("h3", null, t("친구 추가")),
        h("form", { class: "row", onsubmit: async (e) => {
          e.preventDefault();
          ui.email = document.getElementById("friend-email").value.trim();
          if (!ui.email || ui.busy) return;
          ui.busy = true;
          const result = await ask(ui.email);
          ui.busy = false;
          if (result.ok) { ui.email = ""; ui.notice = null; c.toastText(result.text); } else ui.notice = result.text;
          c.render();
        } },
          h("input", { type: "email", id: "friend-email", autocomplete: "off", value: ui.email, placeholder: t("친구의 이메일"), "aria-label": t("친구의 이메일"), style: "flex:1" }),
          h("button", { class: "btn" }, t("신청"))),
        h("p", { class: "small muted hint" }, t("친구가 VOQUIZ에 로그인할 때 쓰는 이메일을 넣으세요. 친구가 수락하면 친구가 돼요."))),

      h("section", { class: "duel-list" },
        h("h3", null, t("내 친구"), h("small", { class: "plain" }, String(friends.length))),
        friends.length === 0
          ? h("div", { class: "empty small" }, t("아직 친구가 없어요. 이메일로 신청하거나 초대 코드를 보내 보세요."))
          : friends.map((f) => h("div", { class: "duel-row" },
              h("span", { class: "who" }, who(f.other), h("small", null, [f.other.grade && `G${f.other.grade}`, f.other.no_duels && t("대결 안 받음")].filter(Boolean).join(" · "))),
              ui.confirm === f.id
                ? [h("button", { class: "mini danger", onclick: () => run(() => api.removeFriend(f.id), t("친구 목록에서 지웠어요.")) }, t("정말 삭제")),
                   h("button", { class: "link", onclick: () => { ui.confirm = null; c.render(); } }, t("취소"))]
                : [h("button", { class: "mini buy", disabled: Boolean(f.other.no_duels), onclick: () => c.startDuel(f.other) }, t("대결")),
                   h("button", { class: "link", onclick: () => { ui.confirm = f.id; c.render(); } }, t("삭제"))]))),

      sent.length > 0 && h("section", { class: "duel-list" },
        h("h3", null, t("보낸 신청")),
        sent.map((f) => h("div", { class: "duel-row" },
          h("span", { class: "who" }, who(f.other)),
          h("span", { class: "tagline" }, t("초대됨")),
          h("button", { class: "link", onclick: () => run(() => api.removeFriend(f.id), t("신청을 취소했어요.")) }, t("취소"))))),

      h("section", { class: "duel-list invites" },
        h("h3", null, t("친구 초대")),
        h("div", { class: "invite-card" },
          h("div", { class: "invite-left" },
            h("b", null, !state.invites ? "…" : t("남은 초대장 {n}장", { n: left })),
            h("small", null, t("초대 코드로 가입한 친구는 바로 내 친구가 돼요."))),
          h("button", { class: "btn", disabled: !state.invites || left === 0, onclick: () => { ui.sharing = 0; c.render(); } }, t("친구에게 공유하기")))),
    ];
  }

  return { refresh
, badge, banner, open, view, ask };
}
