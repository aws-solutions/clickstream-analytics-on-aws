# 数据管理
数据管理模块会自动扫描点击流中的数据，生成元数据，使您能够方便地查看和管理所有事件、事件属性和用户属性。您还可以修改事件和属性的显示名称、描述和数据字典，以便在探索分析模块中更轻松地使用它们。

## 访问数据管理
要访问数据管理，请按照以下步骤进行：

1. 打开**亚马逊云科技点击流分析解决方案的控制台**，在左侧导航栏中单击 **分析工作坊**，浏览器将打开一个新标签页。
2. 在**分析工作坊**页面中,点击左侧导航面板中的**数据管理**图标。

!!! note "注意"

    只有具有 `管理员` 或 `分析师` 角色的用户才能修改元数据，例如显示名称、描述。

## 工作原理
该解决方案会自动扫描点击流数据以生成元数据，然后每天将其存储在 Redshift 中。有三种类型的元数据：

1. **事件**：描述点击流事件的元数据，存储在 Redshift 的 `event_metadata` 表中。
2. **事件参数**：描述点击流事件参数的元数据。
3. **用户属性**：描述用户属性的元数据。

## 元数据维度
下表列出了每种类型元数据中包含的所有维度。

### 事件
| 维度名称 | 描述 |
|-------------|------------|
| 事件名称 | 从 SDK 报告的事件名称 |
| 显示名称 | 事件的显示名称。默认情况下，它与事件名称相同，用户可以自定义显示名称。 |
| 描述 | 从 SDK 报告的事件的描述名称。用户可以自定义显示名称。对于点击流 SDK 自动收集的事件，解决方案已经预填充了描述。 |
| 来源 | 描述事件是如何收集的，`Preset` 表示事件是由 SDK 自动收集的，`Custom` 表示事件是由应用程序所有者定义和收集的 |
| 平台 | 描述事件从哪个平台收集的，即来自 Android、Web 还是 iOS  |
| 上一天的数据量 | 描述上一天（在 UTC 时区中）收集了多少数据 |
| SDK 版本 | 描述收集事件的 SDK 的版本 |
| 关联预设参数 | 与事件关联的预设事件参数 |
| 关联自定义参数 | 与事件关联的自定义事件参数 |

### 事件参数
| 维度名称 | 描述 |
|-------------|------------|
| 参数名称 | 从 SDK 报告的事件事件参数的名称 |
| 显示名称 | 事件参数的显示名称。默认情况下，它与参数名称相同，用户可以自定义显示名称。 |
| 描述 | 从 SDK 报告的事件参数的描述名称。用户可以自定义显示名称。对于点击流 SDK 自动收集的事件参数，解决方案已经预填充了描述。 |
| 来源 | 描述事件参数是如何收集的，`Preset` 表示事件参数是由 SDK 自动收集的，`Custom` 表示事件参数是由应用程序所有者定义和收集的 |
| 数据类型 | 描述事件参数值的数据类型，例如 int、string 等 |
| 关联事件 | 与事件参数关联的事件。 |
| 数据字典| 事件参数的值，用户可以自定义显示值。 |

### 用户属性
| 维度名称 | 描述 |
|-------------|------------|
| 属性名称 | 从 SDK 报告的用户属性的名称 |
| 显示名称 | 用户属性的显示名称。默认情况下，它与属性名称相同，用户可以自定义显示名称。 |
| 描述 | 从 SDK 报告的用户属性的描述名称。用户可以自定义显示名称。对于点击流 SDK 自动收集的用户属性，解决方案已经预填充了描述。 |
| 来源 | 描述用户属性是如何收集的，`Preset` 表示用户属性是由 SDK 自动收集的，`Custom` 表示用户属性是由应用程序所有者定义和收集的 |
| 数据类型 | 描述用户属性值的数据类型，例如 int、string 等 |

## 更新事件显示名称和描述

1. 单击 **事件** 页面，选择任何事件，例如 `view_item`。
2. 单击标有 **显示名称** 的列，输入名称，例如 `查看产品详情`，然后单击确认。
3. 返回到探索，并在筛选器下拉菜单中，您可以看到 `view_item` 现在显示为 `查看产品详情`。

按照相同的步骤更新事件参数和用户属性的显示名称和描述。

## 自定义事件参数值的数据字典

1. 单击 **事件属性** 页面，并在搜索框中选择事件参数，例如 `_entrances`。
2. 属性的详细信息应该会自动打开，选择 **字典** 页面。
3. 单击标有 **显示值** 的列，输入新值，例如 `0` 的 `非首次入口`，输入 `1` 的 `首次入口`，然后单击确认。
4. 返回到探索，并在筛选器下拉菜单中，您可以看到 `_entrances` 显示为 `非首次入口` 和 `首次入口`。

按照相同的步骤为用户属性值自定义数据字典。

## 手动触发元数据扫描工作流程
您可以点击页面右上角的**扫描元数据**按钮来扫描当前应用过去七天的元数据。