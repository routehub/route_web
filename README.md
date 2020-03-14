# ルートハブ(RouteHub)


[![Netlify Status](https://api.netlify.com/api/v1/badges/778e6b8c-b6b3-4c21-a16b-05c7e2f3acae/deploy-status)](https://app.netlify.com/sites/tender-archimedes-e0e6a1/deploys)

<img src="./src/assets/usui.jpg?raw=true" width="100%">


## ルートハブとは
手軽なルート共有・作成サイトです。

2019年にルートラボのクローズの告知をうけて、手軽にルートを作れて仲間に共有できるサイトをつくりたいと思い開発されました。

2020年から、より活発に開発して末永く運営していく目的でソースコードをオープンにして開発コミュニティとともに発展していくことに決めました。

データの保管、リリースはルートハブが行いますが、開発やバグレポートにはどなたでも参加することができます。


## 貢献の仕方
Issues にあるいろいろな修正にご協力いただけると嬉しいです。

詳しくは[貢献の仕方](./CONTRIBUTING.md)を御覧ください。


## 開発者向け情報

### 構成図
以下のうち`route_web`, `route_api`のソースコードを公開しています。
<a href="https://docs.google.com/drawings/d/1-j1wY3Atx18dsJyJvMHZBh-WWlkrLOEM1ZdZeNwHAmQ/edit?usp=sharing"><img src="https://docs.google.com/drawings/d/e/2PACX-1vRTYinMNdPkRYAo9ZMHG3BEYChmmlkCbC6XerniVrXw_tdCU2OEdZ849JUznfzyDQ60tq8GwMY4upkG/pub?w=593&amp;h=323"></a>

### 環境構築の手順
必要となるNode.jsのバージョン: 10.x 以上

```
# 本プロジェクトforkしてcloneする
$ npm install -g ionic
$ npm install
$ ionic serve -l

# http://localhost:8100/ にPC検証サイト
# http://localhost:8200/ にモバイル検証サイトが動作する

```
