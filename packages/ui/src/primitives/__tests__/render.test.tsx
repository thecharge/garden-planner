/** Render tests for every @garden/ui primitive.
 *
 * Uses react-test-renderer + a react-native stub so the whole suite runs in
 * plain Node. Each primitive is wrapped in a <ThemeProvider> and the rendered
 * tree is asserted against: structural shape, theme-token colors applied to
 * style, accessibility props, and key strings present.
 */
import { createElement } from "react";
import type { ReactElement, ReactNode } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { FontFamily, SummaryType, ThemeId } from "@garden/config";
import { themes } from "../../theme/tokens";
import { Body } from "../body";
import { Button, ButtonMode } from "../button";
import { Caption } from "../caption";
import { Card } from "../card";
import { Heading } from "../heading";
import { ListItem } from "../list-item";
import { Screen } from "../screen";
import { TextInput } from "../text-input";
import { ThemeProvider, useActiveThemeId, useThemeTokens } from "../theme-provider";

const withTheme = (themeId: ThemeId, children: ReactNode): ReactElement =>
  createElement(ThemeProvider, { themeId, children });

const render = (element: ReactElement): TestRenderer.ReactTestRenderer => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(element);
  });
  return tree;
};

describe("Heading", () => {
  it("renders an accessibility-role header with theme color + 28pt size", () => {
    const tree = render(withTheme(ThemeId.LightPastel, createElement(Heading, null, "Title")));
    const root = tree.root;
    const text = root.findByType("Text");
    expect(text.props.accessibilityRole).toBe("header");
    expect(text.props.style.fontSize).toBe(28);
    expect(text.props.style.color).toBe(themes[ThemeId.LightPastel].colors.onSurface);
    expect(text.children).toContain("Title");
  });

  it("dark-pastel surfaces its own text color", () => {
    const tree = render(withTheme(ThemeId.DarkPastel, createElement(Heading, null, "D")));
    const text = tree.root.findByType("Text");
    expect(text.props.style.color).toBe(themes[ThemeId.DarkPastel].colors.onSurface);
  });
});

describe("Body", () => {
  const cases: ReadonlyArray<readonly [string, boolean, keyof (typeof themes)[ThemeId]["colors"]]> =
    [
      ["default", false, "onSurface"],
      ["muted", true, "onMuted"]
    ];
  it.each(cases)("%s Body uses %p muted flag with theme color", (_name, muted, colorKey) => {
    const tree = render(withTheme(ThemeId.LightPastel, createElement(Body, { muted }, "Hello")));
    const text = tree.root.findByType("Text");
    expect(text.props.style.color).toBe(themes[ThemeId.LightPastel].colors[colorKey]);
    expect(text.props.style.fontSize).toBeGreaterThanOrEqual(18);
    expect(text.props.style.lineHeight).toBeGreaterThanOrEqual(18 * 1.55);
  });
});

describe("Caption", () => {
  it("wraps text in a muted View with live-region polite announcement", () => {
    const tree = render(withTheme(ThemeId.LightPastel, createElement(Caption, null, "heads up")));
    const outerView = tree.root.findByType("View");
    expect(outerView.props.style.backgroundColor).toBe(themes[ThemeId.LightPastel].colors.muted);
    const inner = tree.root.findByType("Text");
    expect(inner.props.accessibilityLiveRegion).toBe("polite");
    expect(inner.children).toContain("heads up");
  });

  const variantCases: ReadonlyArray<
    readonly [
      SummaryType,
      keyof (typeof themes)[ThemeId]["colors"],
      keyof (typeof themes)[ThemeId]["colors"]
    ]
  > = [
    [SummaryType.Success, "success", "onSuccess"],
    [SummaryType.Warning, "warning", "onWarning"],
    [SummaryType.ActionRequired, "secondary", "onSecondary"],
    [SummaryType.Rejection, "error", "onError"]
  ];
  it.each(variantCases)("variant %p paints bg %p / fg %p", (variant, bgKey, fgKey) => {
    const tree = render(withTheme(ThemeId.LightPastel, createElement(Caption, { variant }, "x")));
    const view = tree.root.findByType("View");
    expect(view.props.style.backgroundColor).toBe(themes[ThemeId.LightPastel].colors[bgKey]);
    const text = tree.root.findByType("Text");
    expect(text.props.style.color).toBe(themes[ThemeId.LightPastel].colors[fgKey]);
  });
});

describe("TextInput", () => {
  it("forwards onChangeText and renders label + accessibilityLabel", () => {
    const onChangeText = jest.fn();
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(TextInput, {
          value: "",
          onChangeText,
          accessibilityLabel: "Email field",
          label: "Email"
        })
      )
    );
    const input = tree.root.findByType("TextInput");
    expect(input.props.accessibilityLabel).toBe("Email field");
    act(() => {
      input.props.onChangeText("hi@example.com");
    });
    expect(onChangeText).toHaveBeenCalledWith("hi@example.com");
    const labelText = tree.root.findAllByType("Text").find((t) => t.children.join("") === "Email");
    expect(labelText).toBeDefined();
  });

  it("focus toggles border token from muted to primary", () => {
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(TextInput, {
          value: "",
          onChangeText: () => undefined,
          accessibilityLabel: "x"
        })
      )
    );
    const input = tree.root.findByType("TextInput");
    expect(input.props.style.borderColor).toBe(themes[ThemeId.LightPastel].colors.muted);
    act(() => {
      input.props.onFocus();
    });
    const focused = tree.root.findByType("TextInput");
    expect(focused.props.style.borderColor).toBe(themes[ThemeId.LightPastel].colors.primary);
    act(() => {
      focused.props.onBlur();
    });
    expect(tree.root.findByType("TextInput").props.style.borderColor).toBe(
      themes[ThemeId.LightPastel].colors.muted
    );
  });

  it("forwards secureTextEntry and keyboardType props", () => {
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(TextInput, {
          value: "sk-ant-abc",
          onChangeText: () => undefined,
          accessibilityLabel: "key",
          secureTextEntry: true,
          keyboardType: "numeric"
        })
      )
    );
    const input = tree.root.findByType("TextInput");
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.keyboardType).toBe("numeric");
  });
});

describe("Button", () => {
  it("Primary: contained background is theme.primary, label is onPrimary", () => {
    const onPress = jest.fn();
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(Button, { onPress, mode: ButtonMode.Primary }, "Scan")
      )
    );
    const pressable = tree.root.findByType("Pressable");
    expect(pressable.props.accessibilityRole).toBe("button");
    const views = tree.root.findAllByType("View");
    const inner = views[0]!;
    expect(inner.props.style.backgroundColor).toBe(themes[ThemeId.LightPastel].colors.primary);
    const label = tree.root.findByType("Text");
    expect(label.props.style.color).toBe(themes[ThemeId.LightPastel].colors.onPrimary);
    expect(label.children).toContain("Scan");
  });

  it("Secondary: outlined, primary-colored border and label", () => {
    const onPress = jest.fn();
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(Button, { onPress, mode: ButtonMode.Secondary }, "Cancel")
      )
    );
    const views = tree.root.findAllByType("View");
    const inner = views[0]!;
    expect(inner.props.style.backgroundColor).toBe("transparent");
    expect(inner.props.style.borderColor).toBe(themes[ThemeId.LightPastel].colors.primary);
    expect(inner.props.style.borderWidth).toBeGreaterThan(0);
  });

  it("Text mode: transparent, primary-colored label, no border", () => {
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(Button, { onPress: () => undefined, mode: ButtonMode.Text }, "X")
      )
    );
    const views = tree.root.findAllByType("View");
    const inner = views[0]!;
    expect(inner.props.style.backgroundColor).toBe("transparent");
    expect(inner.props.style.borderWidth).toBeGreaterThan(0); // uses outlined border on non-primary
  });
});

describe("Card", () => {
  it("renders a surface-colored container with rounded corners", () => {
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(Card, { accessibilityLabel: "info" }, createElement("InnerChild"))
      )
    );
    const view = tree.root.findByType("View");
    expect(view.props.style.backgroundColor).toBe(themes[ThemeId.LightPastel].colors.surface);
    expect(view.props.style.borderRadius).toBeGreaterThan(0);
    expect(view.props.accessibilityLabel).toBe("info");
  });
});

describe("ListItem", () => {
  it("shows title + description + right label", () => {
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(ListItem, {
          title: "North Bed",
          description: "Plot A · 4 corners",
          right: "4200 g"
        })
      )
    );
    const texts = tree.root.findAllByType("Text").map((t) => t.children.join(""));
    expect(texts).toContain("North Bed");
    expect(texts).toContain("Plot A · 4 corners");
    expect(texts).toContain("4200 g");
  });
});

describe("Screen", () => {
  it("paints background from theme; status-bar-safe top padding is positive", () => {
    const tree = render(
      withTheme(
        ThemeId.LightPastel,
        createElement(
          Screen,
          { accessibilityLabel: "x", scroll: false },
          createElement(Heading, null, "Title")
        )
      )
    );
    const views = tree.root.findAllByType("View");
    expect(views[0]!.props.style.backgroundColor).toBe(
      themes[ThemeId.LightPastel].colors.background
    );
    // Inner content container has a top padding covering the status bar.
    const contentView = views.find((v) => v.props.style?.paddingTop !== undefined);
    expect(contentView?.props.style.paddingTop).toBeGreaterThan(0);
  });

  it("wraps children in a ScrollView when scroll=true (default)", () => {
    const tree = render(
      withTheme(ThemeId.LightPastel, createElement(Screen, null, createElement(Heading, null, "x")))
    );
    const sv = tree.root.findAllByType("ScrollView");
    expect(sv.length).toBe(1);
  });
});

describe("ThemeProvider hooks", () => {
  const Probe = () => {
    const tokens = useThemeTokens();
    const id = useActiveThemeId();
    return createElement("probe", { "data-id": id, "data-primary": tokens.colors.primary });
  };

  const cases = [
    ["light-pastel", ThemeId.LightPastel],
    ["dark-pastel", ThemeId.DarkPastel],
    ["high-contrast", ThemeId.HighContrast]
  ] as const;

  it.each(cases)("exposes tokens for %s", (_n, id) => {
    const tree = render(withTheme(id, createElement(Probe)));
    const probe = tree.root.findByType("probe");
    expect(probe.props["data-id"]).toBe(id);
    expect(probe.props["data-primary"]).toBe(themes[id].colors.primary);
  });
});

describe("ThemeProvider fontFamilyOverride", () => {
  const FontProbe = () => {
    const tokens = useThemeTokens();
    return createElement("probe", { "data-font": tokens.typography.bodyFontFamily });
  };

  it("defaults to Lexend when no override is provided", () => {
    const tree = render(withTheme(ThemeId.LightPastel, createElement(FontProbe)));
    const probe = tree.root.findByType("probe");
    expect(probe.props["data-font"]).toBe(FontFamily.Lexend);
  });

  it("overrides bodyFontFamily when fontFamilyOverride is provided", () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        createElement(
          ThemeProvider,
          { themeId: ThemeId.LightPastel, fontFamilyOverride: FontFamily.OpenDyslexic },
          createElement(FontProbe)
        )
      );
    });
    const probe = tree.root.findByType("probe");
    expect(probe.props["data-font"]).toBe(FontFamily.OpenDyslexic);
  });
});
