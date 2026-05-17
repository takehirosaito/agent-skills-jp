# JSON-LD Article schema

ブログ記事に Article schema を埋め込むと、Google SERP で記事リッチリザルトが出やすくなる。

## 最小構成

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "敏感肌の美容液の選び方 5つの基準",
  "datePublished": "2026-05-17",
  "dateModified": "2026-05-17",
  "author": {
    "@type": "Organization",
    "name": "Bloom Petal"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bloom Petal",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "image": "https://example.com/article-hero.jpg",
  "mainEntityOfPage": "https://example.com/blogs/news/sensitive-skin-serum-guide"
}
```

## 推奨構成（著者・専門性付き）

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "敏感肌の美容液の選び方 5つの基準",
  "alternativeHeadline": "ピリピリしない美容液の探し方",
  "description": "敏感肌の方向けに、美容液の選び方を5つの基準で解説します。",
  "datePublished": "2026-05-17T09:00:00+09:00",
  "dateModified": "2026-05-17T09:00:00+09:00",
  "author": {
    "@type": "Person",
    "name": "山田 花子",
    "jobTitle": "美容ライター",
    "url": "https://example.com/authors/yamada"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bloom Petal",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "image": [
    "https://example.com/article-hero-1x1.jpg",
    "https://example.com/article-hero-4x3.jpg",
    "https://example.com/article-hero-16x9.jpg"
  ],
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/blogs/news/sensitive-skin-serum-guide"
  },
  "articleSection": "Skincare",
  "keywords": "美容液, 敏感肌, 選び方, スキンケア",
  "wordCount": 3200
}
```

## Liquid テンプレート

```liquid
{%- if template contains 'article' -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": {{ article.title | json }},
  {%- if article.excerpt != blank -%}
  "description": {{ article.excerpt | strip_html | truncate: 200 | json }},
  {%- endif -%}
  "datePublished": "{{ article.published_at | date: '%Y-%m-%dT%H:%M:%S%:z' }}",
  "dateModified": "{{ article.updated_at | date: '%Y-%m-%dT%H:%M:%S%:z' }}",
  "author": {
    "@type": "Person",
    "name": {{ article.author | json }}
  },
  "publisher": {
    "@type": "Organization",
    "name": {{ shop.name | json }},
    "logo": {
      "@type": "ImageObject",
      "url": "{{ 'logo.png' | asset_url }}"
    }
  },
  {%- if article.image != blank -%}
  "image": "https:{{ article.image | image_url: width: 1200 }}",
  {%- endif -%}
  "mainEntityOfPage": "{{ shop.url }}{{ article.url }}"
}
</script>
{%- endif -%}
```

## FAQ Page schema（記事内 FAQ）

記事内に FAQ セクションがある場合、別途 FAQ schema を出すと SERP で目立つ。

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "敏感肌でも使える美容液はありますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "はい、アルコール・香料・パラベンフリーの低刺激処方の美容液があります。"
      }
    },
    {
      "@type": "Question",
      "name": "美容液は朝晩使うべきですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "商品によりますが、多くは朝晩1日2回を推奨。容器の表示を確認してください。"
      }
    }
  ]
}
```

### Liquid 実装（Metaobject 連動）

記事 metafield に FAQ を持たせる場合：

```liquid
{%- assign faqs = article.metafields.custom.faq.value -%}
{%- if faqs != blank -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {%- for faq in faqs -%}
      {
        "@type": "Question",
        "name": {{ faq.question | json }},
        "acceptedAnswer": {
          "@type": "Answer",
          "text": {{ faq.answer | strip_html | json }}
        }
      }{%- unless forloop.last -%},{%- endunless -%}
    {%- endfor -%}
  ]
}
</script>
{%- endif -%}
```

## HowTo schema（使い方記事）

ステップバイステップの記事には HowTo schema：

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "美容液の正しい使い方",
  "totalTime": "PT5M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "洗顔",
      "text": "ぬるま湯で顔を洗い、肌を整える",
      "image": "https://example.com/step1.jpg"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "化粧水",
      "text": "化粧水で肌に水分を補給",
      "image": "https://example.com/step2.jpg"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "美容液",
      "text": "美容液を適量手に取り、顔全体に",
      "image": "https://example.com/step3.jpg"
    }
  ]
}
```

## 検証

- Google「リッチリザルトテスト」（rich-results.google.com）
- Schema Markup Validator
- Google Search Console「拡張」→「記事」

## よくある間違い

1. **`datePublished` と `dateModified` が逆**：modified は published 以降の日付
2. **`image` が小さい**：最低 1200px width 推奨
3. **`author` が組織名のみ**：YMYL系は個人名＋経歴推奨
4. **`headline` が長すぎる**：110字以内
5. **FAQ schema を実際の記事内容と一致させない**：違反、ペナルティ対象

## チェックリスト

- [ ] Article schema が JSON-LD で出力
- [ ] `datePublished` `dateModified` が ISO 8601
- [ ] `author` が記事内表示と一致
- [ ] `image` が複数比率（1:1, 4:3, 16:9）
- [ ] `mainEntityOfPage` が記事の絶対URL
- [ ] FAQ／HowTo がある記事は対応 schema 追加
- [ ] Google「リッチリザルトテスト」で警告ゼロ
