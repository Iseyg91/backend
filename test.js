<!-- setup.html -->
<!DOCTYPE html>
<html lang="fr" class="dark">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Paramètres du Serveur - Project : Delta Dashboard</title>
  <link rel="icon" href="/assets/delta-icon.png" type="image/png" />
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <link href="/styles/styles_setup.css" rel="stylesheet">
	<link href="/styles/styles_setup.css" rel="stylesheet">
</head>

<body>
  <!-- Navigation supérieure (copiée de index.html) -->
  <nav class="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40 shadow-md">
    <div class="text-3xl font-bold text-indigo-400 animate-pulse">Project : Delta</div>

    <!-- Search bar container (hidden on setup.html as per original index.html structure) -->
    <div class="relative hidden md:block ml-auto mr-14">
      <input id="searchInput" type="text" placeholder="Rechercher..."
             class="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-700 w-96 transition duration-300" />
      <ul id="searchResults"
          class="absolute z-50 w-full mt-2 bg-gray-800 rounded-lg shadow-lg text-sm text-white hidden max-h-60 overflow-y-auto">
      </ul>
    </div>

    <!-- Menu -->
    <button class="text-3xl text-gray-300 md:hidden focus:outline-none" id="burger">☰</button>
	<ul id="menu" class="flex space-x-6 text-sm font-medium text-gray-300 items-center ml-auto">
	  <li>
		<a href="javascript:void(0);" id="dashboard-link"
		   class="bg-gradient-to-r from-blue-500 via-green-500 to-black-500 hover:from-blue-600 hover:to-black-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition duration-300">
		  Dashboard
		</a>
	  </li>
	  <li>
		<a href="./documentation.html"
		   class="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg shadow transition duration-300">
		  Documentation & Infos
		</a>
	  </li>
	  <li>
		<a href="https://discord.com/oauth2/authorize?client_id=1356693934012891176"
		   class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition duration-300">
		  Inviter le bot
		</a>
	  </li>
	  <li>
		<a href="./nouveautes.html"
		   class="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition duration-300">
		  Nouveauté
		</a>
	  </li>
	  <li>
		<a href="./premium.html"
		   class="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition duration-300">
		  Premium
		</a>
	  </li>
	</ul>
  </nav>

  <!-- Conteneur principal du dashboard (sous la nav top) -->
  <div class="dashboard-container pt-24">
    <!-- Barre latérale des serveurs -->
    <aside class="server-sidebar" id="server-sidebar">
      <!-- Les icônes des serveurs seront chargées ici par JavaScript -->
    </aside>

    <!-- Conteneur des deux barres latérales et du contenu principal -->
    <div class="main-content-area">
      <!-- Sidebar des sections (Économie, Modération, Logs) -->
      <aside class="sidebar-sections">
        <h2 class="text-2xl font-bold mb-6">Navigation</h2>
        <nav>
          <ul>
            <li><a href="#" class="sidebar-link active" data-section="economy"><i class="fas fa-coins"></i> Économie</a>
            </li>
            <li><a href="#" class="sidebar-link" data-section="moderation"><i class="fas fa-shield-alt"></i>
                Modération</a></li>
            <li><a href="#" class="sidebar-link" data-section="logs"><i class="fas fa-clipboard-list"></i> Logs</a></li>
            <!-- Ajoutez d'autres sections ici -->
          </ul>
        </nav>
      </aside>

      <!-- Main Content (Contenu de la section active) -->
      <main class="content-section">
        <h1 class="text-3xl font-bold mb-6">Paramètres du Serveur <span id="guild-name"></span></h1>

        <!-- Section Économie -->
        <section id="economy-section" class="content-section-inner">
          <h2 class="text-2xl font-bold mb-4">Paramètres d'Économie</h2>

          <!-- Onglets de navigation pour l'économie -->
          <div class="tabs-container">
            <button class="tab-button active" data-tab="economy-general">Général & Embeds</button>
            <button class="tab-button" data-tab="economy-currency">Monnaie</button>
            <button class="tab-button" data-tab="economy-collect-roles">Rôles de Collect</button>
            <button class="tab-button" data-tab="economy-bonus-command">Commande /bonus</button>
            <button class="tab-button" data-tab="economy-quest-command">Commande /quest</button>
            <button class="tab-button" data-tab="economy-risk-command">Commande /risk</button>
            <button class="tab-button" data-tab="economy-shop">Shop / Magasin</button>
            <button class="tab-button" data-tab="economy-games">Jeux</button>
            <button class="tab-button" data-tab="economy-permissions">Permissions & Commandes</button> <!-- NOUVEL ONGLETT -->
          </div>

          <!-- Contenu de l'onglet Général / Embeds -->
          <div id="economy-general" class="tab-content active">
            <div class="form-section-card">
              <h3>Paramètres Généraux & Embeds</h3>
              <form id="general-embeds-form" class="space-y-6">
                <div class="form-group">
                  <label for="balance-embed-color">Couleur de l'Embed Balance</label>
                  <div class="color-picker-wrapper">
                    <input type="color" id="balance-embed-color" name="balance_embed_color" value="#00ffcc">
                    <input type="text" id="balance-embed-color-text" class="color-hex-input" placeholder="#00ffcc">
                  </div>
                  <p class="text-gray-500 text-sm mt-1">Choisissez la couleur principale des embeds affichant la balance
                    de l'utilisateur.</p>
                </div>
                <!-- Supprimé: Thème de l'Embed Balance -->
                <!--
                <div class="form-group">
                  <label for="balance-embed-theme">Thème de l'Embed Balance</label>
                  <select id="balance-embed-theme" name="balance_embed_theme">
                    <option value="default">Défaut</option>
                    <option value="modern">Moderne</option>
                    <option value="minimal">Minimaliste</option>
                  </select>
                  <p class="text-gray-500 text-sm mt-1">Sélectionnez un thème visuel pour les embeds de balance.</p>
                </div>
                -->
                <div class="form-group">
                  <label for="collect-embed-color">Couleur de l'Embed Collect</label>
                  <div class="color-picker-wrapper">
                    <input type="color" id="collect-embed-color" name="collect_embed_color" value="#00ffcc">
                    <input type="text" id="collect-embed-color-text" class="color-hex-input" placeholder="#00ffcc">
                  </div>
                  <p class="text-gray-500 text-sm mt-1">Choisissez la couleur principale des embeds liés aux commandes
                    de collecte.</p>
                </div>
                <!-- Supprimé: Thème de l'Embed Collect -->
                <!--
                <div class="form-group">
                  <label for="collect-embed-theme">Thème de l'Embed Collect</label>
                  <select id="collect-embed-theme" name="collect_embed_theme">
                    <option value="default">Défaut</option>
                    <option value="modern">Moderne</option>
                    <option value="minimal">Minimaliste</option>
                  </select>
                  <p class="text-gray-500 text-sm mt-1">Sélectionnez un thème visuel pour les embeds de collecte.</p>
                </div>
                -->
                <button type="submit" class="save-button">Sauvegarder les paramètres d'Embed</button>
                <p id="general-embeds-status" class="status-message hidden"></p>
              </form>
            </div>
          </div>

          <!-- Contenu de l'onglet Monnaie -->
          <div id="economy-currency" class="tab-content">
            <div class="form-section-card">
              <h3>Paramètres de la Monnaie</h3>
              <form id="currency-form" class="space-y-6">
                <div class="form-group">
                  <label for="currency-name">Nom de la monnaie</label>
                  <input type="text" id="currency-name" placeholder="Ex: Pièces d'or">
                  <p class="text-gray-500 text-sm mt-1">Définissez le nom de la monnaie utilisée sur votre serveur (ex:
                    "Pièces d'or", "Crédits").</p>
                </div>
                <div class="form-group">
                  <label for="currency-symbol">Symbole de la monnaie</label>
                  <input type="text" id="currency-symbol" placeholder="Ex: 💰">
                  <p class="text-gray-500 text-sm mt-1">Choisissez un symbole ou un emoji pour représenter votre monnaie
                    (ex: "💰", "💎").</p>
                </div>
                <button type="submit" class="save-button">Sauvegarder les paramètres de monnaie</button>
                <p id="currency-status" class="status-message hidden"></p>
              </form>
            </div>
          </div>

          <!-- Contenu de l'onglet Rôles de Collect -->
          <div id="economy-collect-roles" class="tab-content">
            <div class="form-section-card">
              <h3>Gestion des Rôles de Collect</h3>
              <p class="text-gray-400 mb-4">Configurez des rôles spécifiques qui, lorsqu'un utilisateur les possède, lui
                permettent de collecter de la monnaie avec un montant et un cooldown définis.</p>
              <div id="collect-roles-list" class="space-y-2">
                <!-- Les rôles de collect seront listés ici -->
              </div>
              <form id="add-collect-role-form" class="space-y-4 mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <h4 class="text-lg font-semibold mb-2 text-indigo-300">Ajouter un nouveau rôle de collect</h4>
                <div class="form-group">
                  <label for="collect-role-select">Rôle Discord</label>
                  <div class="role-select-wrapper">
                    <select id="collect-role-select" required class="w-full">
                      <option value="">Chargement des rôles...</option>
                    </select>
                  </div>
                  <p class="text-gray-500 text-sm mt-1">Sélectionnez le rôle Discord qui donnera accès à la collecte.
                  </p>
                </div>
                <div class="form-group">
                  <label for="collect-amount">Montant de la collecte</label>
                  <input type="number" id="collect-amount" min="1" required>
                  <p class="text-gray-500 text-sm mt-1">Le montant de monnaie que les utilisateurs avec ce rôle
                    recevront à chaque collecte.</p>
                </div>
                <div class="form-group">
                  <label>Cooldown</label>
                  <div class="cooldown-input-group">
                    <input type="number" id="collect-cooldown-days" min="0" value="0"><span>j</span>
                    <input type="number" id="collect-cooldown-hours" min="0" max="23" value="0"><span>h</span>
                    <input type="number" id="collect-cooldown-minutes" min="0" max="59" value="0"><span>m</span>
                    <input type="number" id="collect-cooldown-seconds" min="0" max="59" value="0"><span>s</span>
                  </div>
                  <p class="text-gray-500 text-sm mt-1">La durée avant qu'un utilisateur puisse collecter à nouveau
                    (jours, heures, minutes, secondes).</p>
                </div>
                <button type="submit" class="save-button">Ajouter le rôle de collect</button>
                <p id="add-collect-role-status" class="status-message hidden"></p>
              </form>
            </div>
          </div>

          <!-- Contenu de l'onglet Commande /bonus -->
          <div id="economy-bonus-command" class="tab-content">
            <div class="form-section-card">
              <h3>Paramètres de la Commande `/bonus`</h3>
              <p class="text-gray-400 mb-4">Configurez la commande `/bonus` qui permet aux utilisateurs de recevoir une
                somme aléatoire de monnaie après un certain temps.</p>
              <form id="bonus-command-form" class="space-y-6">
                <div class="form-group">
                  <label for="bonus-embed-color">Couleur de l'Embed Bonus</label>
                  <div class="color-picker-wrapper">
                    <input type="color" id="bonus-embed-color" name="embed_color" value="#00ffcc">
                    <input type="text" id="bonus-embed-color-text" class="color-hex-input" placeholder="#00ffcc">
                  </div>
                  <p class="text-gray-500 text-sm mt-1">Choisissez la couleur principale de l'embed affiché lors de
                    l'utilisation de la commande `/bonus`.</p>
                </div>
                <div class="form-group">
                  <label for="bonus-success-message">Message de succès</label>
                  <textarea id="bonus-success-message" name="success_message" rows="3"
                    placeholder="Ex: Félicitations ! Vous avez gagné {amount} !"></textarea>
                  <p class="text-gray-500 text-sm mt-1">Le message affiché lorsque l'utilisateur utilise la commande
                    avec succès. Utilisez <code class="text-indigo-300">{amount}</code> pour afficher l'argent gagné.
                  </p>
                </div>
                <div class="form-group">
                  <label>Cooldown</label>
                  <div class="cooldown-input-group">
                    <input type="number" id="bonus-cooldown-days" min="0" value="0"><span>j</span>
                    <input type="number" id="bonus-cooldown-hours" min="0" max="23" value="0"><span>h</span>
                    <input type="number" id="bonus-cooldown-minutes" min="0" max="59" value="0"><span>m</span>
                    <input type="number" id="bonus-cooldown-seconds" min="0" max="59" value="0"><span>s</span>
                  </div>
                  <p class="text-gray-500 text-sm mt-1">La durée avant qu'un utilisateur puisse utiliser la commande
                    `/bonus` à nouveau.</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="bonus-min-gain">Gain Minimum</label>
                    <input type="number" id="bonus-min-gain" name="min_gain" min="1" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant minimum de monnaie que l'utilisateur peut gagner.
                    </p>
                  </div>
                  <div class="form-group">
                    <label for="bonus-max-gain">Gain Maximum</label>
                    <input type="number" id="bonus-max-gain" name="max_gain" min="1" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant maximum de monnaie que l'utilisateur peut gagner.
                    </p>
                  </div>
                </div>
                <button type="submit" class="save-button">Sauvegarder les paramètres /bonus</button>
                <p id="bonus-command-status" class="status-message hidden"></p>
              </form>
            </div>
          </div>

          <!-- Contenu de l'onglet Commande /quest -->
          <div id="economy-quest-command" class="tab-content">
            <div class="form-section-card">
              <h3>Paramètres de la Commande `/quest`</h3>
              <p class="text-gray-400 mb-4">Configurez la commande `/quest` où les utilisateurs peuvent tenter une quête
                avec un gain ou une perte aléatoire.</p>
              <form id="quest-command-form" class="space-y-6">
                <div class="form-group">
                  <label for="quest-embed-color">Couleur de l'Embed Quest</label>
                  <div class="color-picker-wrapper">
                    <input type="color" id="quest-embed-color" name="embed_color" value="#00ffcc">
                    <input type="text" id="quest-embed-color-text" class="color-hex-input" placeholder="#00ffcc">
                  </div>
                  <p class="text-gray-500 text-sm mt-1">Choisissez la couleur principale de l'embed affiché lors de
                    l'utilisation de la commande `/quest`.</p>
                </div>
                <div class="form-group">
                  <label for="quest-success-message">Message de succès</label>
                  <textarea id="quest-success-message" name="success_message" rows="3"
                    placeholder="Ex: Vous avez réussi la quête et gagné {amount} !"></textarea>
                  <p class="text-gray-500 text-sm mt-1">Le message affiché si l'utilisateur réussit la quête. Utilisez
                    <code class="text-indigo-300">{amount}</code> pour afficher l'argent gagné.</p>
                </div>
                <div class="form-group">
                  <label for="quest-unsuccess-message">Message d'échec</label>
                  <textarea id="quest-unsuccess-message" name="unsuccess_message" rows="3"
                    placeholder="Ex: Vous avez échoué la quête et perdu {amount} !"></textarea>
                  <p class="text-gray-500 text-sm mt-1">Le message affiché si l'utilisateur échoue la quête. Utilisez
                    <code class="text-indigo-300">{amount}</code> pour afficher l'argent perdu.</p>
                </div>
                <div class="form-group">
                  <label>Cooldown</label>
                  <div class="cooldown-input-group">
                    <input type="number" id="quest-cooldown-days" min="0" value="0"><span>j</span>
                    <input type="number" id="quest-cooldown-hours" min="0" max="23" value="0"><span>h</span>
                    <input type="number" id="quest-cooldown-minutes" min="0" max="59" value="0"><span>m</span>
                    <input type="number" id="quest-cooldown-seconds" min="0" max="59" value="0"><span>s</span>
                  </div>
                  <p class="text-gray-500 text-sm mt-1">La durée avant qu'un utilisateur puisse tenter une nouvelle
                    quête.</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="quest-min-positive">Gain Min. (si succès)</label>
                    <input type="number" id="quest-min-positive" name="min_positive" min="1" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant minimum de monnaie gagné en cas de succès.</p>
                  </div>
                  <div class="form-group">
                    <label for="quest-max-positive">Gain Max. (si succès)</label>
                    <input type="number" id="quest-max-positive" name="max_positive" min="1" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant maximum de monnaie gagné en cas de succès.</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="quest-min-negative">Perte Min. (si échec)</label>
                    <input type="number" id="quest-min-negative" name="min_negative" max="0" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant minimum de monnaie perdu en cas d'échec (doit être
                      négatif).</p>
                  </div>
                  <div class="form-group">
                    <label for="quest-max-negative">Perte Max. (si échec)</label>
                    <input type="number" id="quest-max-negative" name="max_negative" max="0" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant maximum de monnaie perdu en cas d'échec (doit être
                      négatif).</p>
                  </div>
                </div>
                <button type="submit" class="save-button">Sauvegarder les paramètres /quest</button>
                <p id="quest-command-status" class="status-message hidden"></p>
              </form>
            </div>
          </div>

          <!-- Contenu de l'onglet Commande /risk -->
          <div id="economy-risk-command" class="tab-content">
            <div class="form-section-card">
              <h3>Paramètres de la Commande `/risk`</h3>
              <p class="text-gray-400 mb-4">Configurez la commande `/risk` où les utilisateurs peuvent prendre un risque
                pour gagner gros ou tout perdre.</p>
              <form id="risk-command-form" class="space-y-6">
                <div class="form-group">
                  <label for="risk-embed-color">Couleur de l'Embed Risk</label>
                  <div class="color-picker-wrapper">
                    <input type="color" id="risk-embed-color" name="embed_color" value="#00ffcc">
                    <input type="text" id="risk-embed-color-text" class="color-hex-input" placeholder="#00ffcc">
                  </div>
                  <p class="text-gray-500 text-sm mt-1">Choisissez la couleur principale de l'embed affiché lors de
                    l'utilisation de la commande `/risk`.</p>
                </div>
                <div class="form-group">
                  <label for="risk-success-message">Message de succès</label>
                  <textarea id="risk-success-message" name="success_message" rows="3"
                    placeholder="Ex: Vous avez pris un risque et gagné {amount} !"></textarea>
                  <p class="text-gray-500 text-sm mt-1">Le message affiché si l'utilisateur réussit son pari. Utilisez
                    <code class="text-indigo-300">{amount}</code> pour afficher l'argent gagné.</p>
                </div>
                <div class="form-group">
                  <label for="risk-unsuccess-message">Message d'échec</label>
                  <textarea id="risk-unsuccess-message" name="unsuccess_message" rows="3"
                    placeholder="Ex: Oh non ! Vous avez perdu {amount} !"></textarea>
                  <p class="text-gray-500 text-sm mt-1">Le message affiché si l'utilisateur échoue son pari. Utilisez
                    <code class="text-indigo-300">{amount}</code> pour afficher l'argent perdu.</p>
                </div>
                <div class="form-group">
                  <label>Cooldown</label>
                  <div class="cooldown-input-group">
                    <input type="number" id="risk-cooldown-days" min="0" value="0"><span>j</span>
                    <input type="number" id="risk-cooldown-hours" min="0" max="23" value="0"><span>h</span>
                    <input type="number" id="risk-cooldown-minutes" min="0" max="59" value="0"><span>m</span>
                    <input type="number" id="risk-cooldown-seconds" min="0" max="59" value="0"><span>s</span>
                  </div>
                  <p class="text-gray-500 text-sm mt-1">La durée avant qu'un utilisateur puisse prendre un nouveau
                    risque.</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="risk-min-positive">Gain Min. (si succès)</label>
                    <input type="number" id="risk-min-positive" name="min_positive" min="1" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant minimum de monnaie gagné en cas de succès.</p>
                  </div>
                  <div class="form-group">
                    <label for="risk-max-positive">Gain Max. (si succès)</label>
                    <input type="number" id="risk-max-positive" name="max_positive" min="1" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant maximum de monnaie gagné en cas de succès.</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="risk-min-negative">Perte Min. (si échec)</label>
                    <input type="number" id="risk-min-negative" name="min_negative" max="0" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant minimum de monnaie perdu en cas d'échec (doit être
                      négatif).</p>
                  </div>
                  <div class="form-group">
                    <label for="risk-max-negative">Perte Max. (si échec)</label>
                    <input type="number" id="risk-max-negative" name="max_negative" max="0" required>
                    <p class="text-gray-500 text-sm mt-1">Le montant maximum de monnaie perdu en cas d'échec (doit être
                      négatif).</p>
                  </div>
                </div>
                <button type="submit" class="save-button">Sauvegarder les paramètres /risk</button>
                <p id="risk-command-status" class="status-message hidden"></p>
              </form>
            </div>
          </div>

          <!-- Contenu de l'onglet Shop / Magasin -->
          <div id="economy-shop" class="tab-content">
            <div class="form-section-card">
              <h3>Gestion du Magasin</h3>
              <p class="text-gray-400 mb-4">Ajoutez, modifiez ou supprimez des articles de votre magasin. Configurez
                leurs propriétés, prix, conditions et actions.</p>

              <div id="shop-items-list" class="space-y-4 mb-6">
                <!-- Les items du shop seront listés ici -->
              </div>

              <button id="add-new-item-btn" class="add-dynamic-btn">Ajouter un nouvel article</button>

              <div id="item-form-container" class="hidden mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <h4 id="item-form-title" class="text-lg font-semibold mb-4 text-indigo-300">Ajouter un article</h4>
                <form id="shop-item-form" class="space-y-4">
                  <input type="hidden" id="item-id-hidden">
                  <div class="form-group">
                    <label for="item-name">Nom de l'article</label>
                    <input type="text" id="item-name" required>
                    <p class="text-gray-500 text-sm mt-1">Le nom de l'article tel qu'il apparaîtra dans le magasin.</p>
                  </div>
                  <div class="form-group">
                    <label for="item-description">Description</label>
                    <textarea id="item-description" rows="3"></textarea>
                    <p class="text-gray-500 text-sm mt-1">Une brève description de l'article.</p>
                  </div>

                  <!-- NOUVEAU CHAMP POUR L'IMAGE/EMOJI -->
                  <div class="form-group">
                    <label for="item-image-value">Emoji par défaut ou lien d'emoji Discord</label>
                    <input type="text" id="item-image-value"
                      placeholder="Ex: 📦, <:nom_emoji:ID_emoji>, ou URL d'emoji Discord">
                    <p class="text-gray-500 text-sm mt-1" id="item-image-help-text">
                      Saisissez un emoji Unicode (ex: 👍), un emoji personnalisé Discord (ex: `<:nom_emoji:ID_emoji>`),
                        ou une URL directe d'emoji Discord.
                    </p>
                    <div id="emoji-preview-container">
                      <img id="emoji-preview" src="" alt="Aperçu de l'emoji" class="hidden">
                      <span id="emoji-text-preview" class="text-2xl"></span>
                    </div>
                  </div>
                  <!-- FIN NOUVEAU CHAMP -->

                  <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                      <label for="item-price">Prix</label>
                      <input type="number" id="item-price" min="0" required>
                      <p class="text-gray-500 text-sm mt-1">Le coût de l'article en monnaie du serveur.</p>
                    </div>
                    <div class="form-group">
                      <label for="item-stock">Stock disponible</label>
                      <input type="number" id="item-stock" min="0">
                      <p class="text-gray-500 text-sm mt-1">Le nombre d'articles disponibles à la vente. Laissez vide ou
                        à 0 si le stock est illimité.</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-4">
                    <div class="form-group flex items-center gap-2">
                      <input type="checkbox" id="item-sellable"
                        class="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
                      <label for="item-sellable" class="mb-0">Vendable</label>
                      <p class="text-gray-500 text-sm mt-1">Cochez si cet article peut être acheté par les utilisateurs.
                      </p>
                    </div>
                    <div class="form-group flex items-center gap-2">
                      <input type="checkbox" id="item-usable"
                        class="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
                      <label for="item-usable" class="mb-0">Utilisable</label>
                      <p class="text-gray-500 text-sm mt-1">Cochez si cet article peut être utilisé par les utilisateurs
                        depuis leur inventaire.</p>
                    </div>
                    <div class="form-group flex items-center gap-2">
                      <input type="checkbox" id="item-inventory"
                        class="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
                      <label for="item-inventory" class="mb-0">Ajouter à l'inventaire de l'utilisateur après
                        achat</label>
                      <p class="text-gray-500 text-sm mt-1">Cochez si l'article doit être ajouté à l'inventaire de
                        l'utilisateur après l'achat.</p>
                    </div>
                  </div>
                  <div class="form-group flex items-center gap-2">
                    <input type="checkbox" id="item-unlimited-stock"
                      class="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
                    <label for="item-unlimited-stock" class="mb-0">Stock illimité</label>
                    <p class="text-gray-500 text-sm mt-1">Cochez si le nombre d'articles disponibles est illimité (le
                      champ "Stock disponible" sera ignoré).</p>
                  </div>

                  <!-- Nouveau champ: Quantité maximale par transaction -->
                  <div class="form-group">
                    <label for="item-max-purchase-per-transaction">Quantité maximale par transaction</label>
                    <input type="number" id="item-max-purchase-per-transaction" min="1">
                    <p class="text-gray-500 text-sm mt-1">Le nombre maximum de cet article qu'un utilisateur peut
                      acheter en une seule commande. Laissez vide pour illimité.</p>
                  </div>
                  <!-- Fin nouveau champ -->


                  <h4 class="text-md font-semibold mt-6 mb-2 text-indigo-300">Conditions d'achat (Requirements)</h4>
                  <p class="text-gray-500 text-sm mb-3">Définissez les conditions que l'utilisateur doit remplir pour
                    pouvoir acheter cet article.</p>
                  <div id="item-requirements-container">
                    <!-- Dynamic requirements will be added here -->
                  </div>
                  <button type="button" id="add-requirement-btn" class="add-dynamic-btn text-sm px-4 py-2">Ajouter une
                    condition</button>

                  <h4 class="text-md font-semibold mt-6 mb-2 text-indigo-300">Conditions d'utilisation (Requirements)
                  </h4>
                  <p class="text-gray-500 text-sm mb-3">Définissez les conditions que l'utilisateur doit remplir pour
                    pouvoir utiliser cet article depuis son inventaire.</p>
                  <div id="item-on-use-requirements-container">
                    <!-- Dynamic on use requirements will be added here -->
                  </div>
                  <button type="button" id="add-on-use-requirement-btn"
                    class="add-dynamic-btn text-sm px-4 py-2">Ajouter une condition</button>

                  <h4 class="text-md font-semibold mt-6 mb-2 text-indigo-300">Actions à l'achat (On Purchase Actions)
                  </h4>
                  <p class="text-gray-500 text-sm mb-3">Définissez les actions qui seront exécutées lorsque
                    l'utilisateur achète cet article.</p>
                  <div id="item-on-purchase-actions-container">
                    <!-- Dynamic actions will be added here -->
                  </div>
                  <button type="button" id="add-on-purchase-action-btn"
                    class="add-dynamic-btn text-sm px-4 py-2">Ajouter une action</button>

                  <h4 class="text-md font-semibold mt-6 mb-2 text-indigo-300">Actions à l'utilisation (On Use Actions)
                  </h4>
                  <p class="text-gray-500 text-sm mb-3">Définissez les actions qui seront exécutées lorsque
                    l'utilisateur utilise cet article depuis son inventaire.</p>
                  <div id="item-on-use-actions-container">
                    <!-- Dynamic actions will be added here -->
                  </div>
                  <button type="button" id="add-on-use-action-btn" class="add-dynamic-btn text-sm px-4 py-2">Ajouter une
                    action</button>

                  <button type="submit" class="save-button mt-6">Sauvegarder l'article</button>
                  <p id="shop-item-status" class="status-message hidden"></p>
                </form>
              </div>
            </div>
          </div>

          <!-- Nouveau Contenu de l'onglet Jeux -->
          <div id="economy-games" class="tab-content">
            <div class="form-section-card">
              <h3>Paramètres des Jeux d'Argent</h3>
              <p class="text-gray-400 mb-4">Configurez les différents jeux d'argent disponibles sur votre serveur.
                Chaque jeu peut avoir ses propres règles, mises minimales/maximales et probabilités de gain.</p>

              <div class="tabs-container">
                <button class="tab-button active" data-game-tab="game-crash">Crash Game</button>
                <button class="tab-button" data-game-tab="game-plinko">Plinko</button>
                <button class="tab-button" data-game-tab="game-roulette">Roulette</button>
                <button class="tab-button" data-game-tab="game-dice">Dice Roll</button>
              </div>

              <!-- Contenu du Crash Game -->
              <div id="game-crash" class="game-tab-content active">
                <div class="form-section-card mt-4">
                  <h3>Crash Game</h3>
                  <p class="text-gray-400 mb-4">
                    Le **Crash Game** est un jeu de hasard où un multiplicateur augmente progressivement à partir de 1x.
                    Les joueurs placent une mise et doivent encaisser leurs gains avant que le jeu ne "crash" (s'arrête).
                    Si le jeu crash avant que le joueur n'ait encaissé, il perd sa mise. Plus le multiplicateur est élevé,
                    plus le gain potentiel est grand, mais plus le risque de crash est imminent.
                  </p>
                  <form id="crash-game-form" class="space-y-6">
                    <div class="form-group">
                      <label for="crash-embed-color">Couleur de l'Embed</label>
                      <div class="color-picker-wrapper">
                        <input type="color" id="crash-embed-color" name="embed_color" value="#FF0000">
                        <input type="text" id="crash-embed-color-text" class="color-hex-input" placeholder="#FF0000">
                      </div>
                      <p class="text-gray-500 text-sm mt-1">Couleur principale des messages du jeu Crash.</p>
                    </div>
                    <div class="form-group">
                      <label for="crash-min-bet">Mise Minimale</label>
                      <input type="number" id="crash-min-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise minimale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label for="crash-max-bet">Mise Maximale</label>
                      <input type="number" id="crash-max-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise maximale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label for="crash-min-multiplier">Multiplicateur Minimal</label>
                      <input type="number" id="crash-min-multiplier" min="1.01" step="0.01" required>
                      <p class="text-gray-500 text-sm mt-1">Le multiplicateur le plus bas que le jeu peut atteindre avant de crasher.</p>
                    </div>
                    <div class="form-group">
                      <label for="crash-max-multiplier">Multiplicateur Maximal</label>
                      <input type="number" id="crash-max-multiplier" min="1.01" step="0.01" required>
                      <p class="text-gray-500 text-sm mt-1">Le multiplicateur le plus haut que le jeu peut potentiellement atteindre.</p>
                    </div>
                    <div class="form-group">
                      <label for="crash-crash-chance">Probabilité de Crash Précoce (en %)</label>
                      <input type="number" id="crash-crash-chance" min="1" max="99" required>
                      <p class="text-gray-500 text-sm mt-1">La probabilité (en pourcentage) que le jeu crash à un multiplicateur faible. Une valeur plus élevée signifie plus de crashs rapides.</p>
                    </div>
                    <button type="submit" class="save-button">Sauvegarder les paramètres Crash Game</button>
                    <p id="crash-game-status" class="status-message hidden"></p>
                  </form>
                </div>
              </div>

              <!-- Contenu du Plinko -->
              <div id="game-plinko" class="game-tab-content hidden">
                <div class="form-section-card mt-4">
                  <h3>Plinko</h3>
                  <p class="text-gray-400 mb-4">
                    Le **Plinko** est un jeu où une bille est lâchée du haut d'un plateau rempli de "pins" (chevilles).
                    La bille rebondit de pin en pin jusqu'à atteindre l'un des emplacements de multiplicateurs en bas du plateau.
                    Le gain du joueur est déterminé par le multiplicateur de l'emplacement où la bille atterrit.
                  </p>
                  <form id="plinko-game-form" class="space-y-6">
                    <div class="form-group">
                      <label for="plinko-embed-color">Couleur de l'Embed</label>
                      <div class="color-picker-wrapper">
                        <input type="color" id="plinko-embed-color" name="embed_color" value="#00FF00">
                        <input type="text" id="plinko-embed-color-text" class="color-hex-input" placeholder="#00FF00">
                      </div>
                      <p class="text-gray-500 text-sm mt-1">Couleur principale des messages du jeu Plinko.</p>
                    </div>
                    <div class="form-group">
                      <label for="plinko-min-bet">Mise Minimale</label>
                      <input type="number" id="plinko-min-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise minimale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label for="plinko-max-bet">Mise Maximale</label>
                      <input type="number" id="plinko-max-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise maximale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label for="plinko-rows">Nombre de Lignes (Pins)</label>
                      <input type="number" id="plinko-rows" min="8" max="16" required>
                      <p class="text-gray-500 text-sm mt-1">Le nombre de lignes de "pins" sur le plateau de Plinko. Pour
                        `N` lignes, il y a `N+1` emplacements de multiplicateurs en bas. Plus de lignes augmentent la complexité et la variance des résultats.</p>
                    </div>
                    <div class="form-group">
                      <label>Multiplicateurs (doit y en avoir `Nombre de Lignes + 1`)</label>
                      <p class="text-gray-500 text-sm mb-2">Définissez les multiplicateurs possibles pour chaque "slot"
                        en bas du plateau. Assurez-vous que le nombre de multiplicateurs correspond au nombre de lignes
                        + 1. Par exemple, pour 8 lignes, il faut 9 multiplicateurs.</p>
                      <div id="plinko-multipliers-container" class="space-y-2">
                        <!-- Multiplicateurs Plinko dynamiques -->
                      </div>
                      <button type="button" id="add-plinko-multiplier-btn"
                        class="add-dynamic-btn text-sm px-4 py-2 mt-2">Ajouter un multiplicateur</button>
                    </div>
                    <button type="submit" class="save-button">Sauvegarder les paramètres Plinko</button>
                    <p id="plinko-game-status" class="status-message hidden"></p>
                  </form>
                </div>
              </div>

              <!-- Contenu de la Roulette -->
              <div id="game-roulette" class="game-tab-content hidden">
                <div class="form-section-card mt-4">
                  <h3>Roulette</h3>
                  <p class="text-gray-400 mb-4">
                    La **Roulette** est un jeu de casino classique où les joueurs parient sur le résultat d'une roue tournante.
                    Les paris peuvent être placés sur des numéros individuels, des groupes de numéros, des couleurs (rouge/noir),
                    ou si le numéro sera pair ou impair. Le bot simule le lancer de la bille et attribue les gains en fonction des paris gagnants.
                  </p>
                  <form id="roulette-game-form" class="space-y-6">
                    <div class="form-group">
                      <label for="roulette-embed-color">Couleur de l'Embed</label>
                      <div class="color-picker-wrapper">
                        <input type="color" id="roulette-embed-color" name="embed_color" value="#0000FF">
                        <input type="text" id="roulette-embed-color-text" class="color-hex-input" placeholder="#0000FF">
                      </div>
                      <p class="text-gray-500 text-sm mt-1">Couleur principale des messages du jeu Roulette.</p>
                    </div>
                    <div class="form-group">
                      <label for="roulette-min-bet">Mise Minimale</label>
                      <input type="number" id="roulette-min-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise minimale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label for="roulette-max-bet">Mise Maximale</label>
                      <input type="number" id="roulette-max-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise maximale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label>Résultats de la Roulette</label>
                      <p class="text-gray-500 text-sm mt-1 mb-2">
                        Définissez les différents types de paris possibles (couleur, pair/impair, numéros spécifiques)
                        avec leurs multiplicateurs et les numéros associés.
                        Utilisez des codes hexadécimaux pour les couleurs (ex: #FF0000 pour rouge).
                        Les numéros doivent être séparés par des virgules (ex: 1,3,5).
                        Pour les paris "pair" ou "impair", listez tous les numéros pairs/impairs correspondants.
                      </p>
                      <div id="roulette-outcomes-container" class="space-y-2">
                        <!-- Résultats de Roulette dynamiques -->
                      </div>
                      <button type="button" id="add-roulette-outcome-btn"
                        class="add-dynamic-btn text-sm px-4 py-2 mt-2">Ajouter un résultat</button>
                    </div>
                    <button type="submit" class="save-button">Sauvegarder les paramètres Roulette</button>
                    <p id="roulette-game-status" class="status-message hidden"></p>
                  </form>
                </div>
              </div>

              <!-- Contenu du Dice Roll -->
              <div id="game-dice" class="game-tab-content hidden">
                <div class="form-section-card mt-4">
                  <h3>Dice Roll</h3>
                  <p class="text-gray-400 mb-4">
                    Le **Dice Roll** est un jeu simple où les joueurs parient sur le résultat d'un lancer de dé virtuel.
                    Les joueurs choisissent un nombre cible et un type de pari (par exemple, "plus grand que" ou "plus petit que").
                    Si le résultat du dé correspond à leur pari, ils gagnent un multiplicateur de leur mise.
                  </p>
                  <form id="dice-game-form" class="space-y-6">
                    <div class="form-group">
                      <label for="dice-embed-color">Couleur de l'Embed</label>
                      <div class="color-picker-wrapper">
                        <input type="color" id="dice-embed-color" name="embed_color" value="#FFFF00">
                        <input type="text" id="dice-embed-color-text" class="color-hex-input" placeholder="#FFFF00">
                      </div>
                      <p class="text-gray-500 text-sm mt-1">Couleur principale des messages du jeu Dice Roll.</p>
                    </div>
                    <div class="form-group">
                      <label for="dice-min-bet">Mise Minimale</label>
                      <input type="number" id="dice-min-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise minimale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label for="dice-max-bet">Mise Maximale</label>
                      <input type="number" id="dice-max-bet" min="1" required>
                      <p class="text-gray-500 text-sm mt-1">La mise maximale que les joueurs peuvent placer.</p>
                    </div>
                    <div class="form-group">
                      <label for="dice-min-roll">Prédiction Minimale (1-99)</label>
                      <input type="number" id="dice-min-roll" min="1" max="99" required>
                      <p class="text-gray-500 text-sm mt-1">Le nombre le plus bas que l'utilisateur peut prédire comme cible.</p>
                    </div>
                    <div class="form-group">
                      <label for="dice-max-roll">Prédiction Maximale (1-99)</label>
                      <input type="number" id="dice-max-roll" min="1" max="99" required>
                      <p class="text-gray-500 text-sm mt-1">Le nombre le plus haut que l'utilisateur peut prédire comme cible.</p>
                    </div>
                    <button type="submit" class="save-button">Sauvegarder les paramètres Dice Roll</button>
                    <p id="dice-command-status" class="status-message hidden"></p>
                  </form>
                </div>
              </div>

            </div>
          </div>
          <!-- Fin Nouveau Contenu de l'onglet Jeux -->

          <!-- NOUVEL ONGLETT: Permissions & Commandes -->
          <div id="economy-permissions" class="tab-content">
            <div class="form-section-card">
              <h3>Gestion des Permissions d'Économie</h3>
              <p class="text-gray-400 mb-4">Définissez les rôles qui peuvent utiliser les commandes d'administration d'économie et activez/désactivez des commandes spécifiques.</p>

              <form id="permissions-form" class="space-y-6">
                <div class="form-group">
                  <label for="admin-roles-select" class="text-lg font-semibold text-indigo-300">Rôles Administrateurs d'Économie</label>
                  <p class="text-gray-500 text-sm mt-1 mb-2">Sélectionnez les rôles qui auront la permission d'utiliser les commandes d'administration d'économie (ex: `/add-money`, `/remove-money`, `/add-inventory`, `/remove-inventory`).</p>
                  <div id="admin-roles-container" class="space-y-2">
                    <!-- Les rôles admin seront listés ici -->
                  </div>
                  <button type="button" id="add-admin-role-btn" class="add-dynamic-btn text-sm px-4 py-2 mt-2">Ajouter un rôle administrateur</button>
                </div>

                <div class="form-group mt-8">
                  <label class="text-lg font-semibold text-indigo-300">Activation/Désactivation des Commandes</label>
                  <p class="text-gray-500 text-sm mt-1 mb-4">Contrôlez quelles commandes d'économie sont actives sur votre serveur. Vous pouvez désactiver une commande entièrement, ou seulement son utilisation via slash (`/`) ou préfixe (`!`).</p>
                  
                  <div id="command-toggles-container" class="space-y-4">
                    <!-- Les toggles de commandes seront générés ici -->
                  </div>
                </div>

                <button type="submit" class="save-button mt-6">Sauvegarder les Permissions & Commandes</button>
                <p id="permissions-status" class="status-message hidden"></p>
              </form>
            </div>
          </div>
          <!-- FIN NOUVEL ONGLETT -->

        </section>

        <!-- Section Modération (initialement cachée) -->
        <section id="moderation-section" class="content-section hidden">
          <h2 class="text-2xl font-bold mb-4">Paramètres de Modération</h2>
          <p class="text-gray-400">Contenu pour la modération...</p>
        </section>

        <!-- Section Logs (initialement cachée) -->
        <section id="logs-section" class="content-section hidden">
          <h2 class="text-2xl font-bold mb-4">Paramètres des Logs</h2>
          <p class="text-gray-400">Contenu pour les logs...</p>
        </section>
      </main>
    </div>
  </div>

  <!-- Home Button (bottom-left) -->
  <a href="./index.html" aria-label="Retour à l'accueil" class="fixed bottom-6 left-6 z-50 group inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-semibold shadow-xl backdrop-blur-xl backdrop-saturate-200 bg-opacity-80 transition-all duration-500 ease-in-out hover:scale-[1.12] active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500 ring-offset-2 ring-offset-gray-900 text-sm md:text-base overflow-hidden animate-fade-in animate-floating bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700">
    <span aria-hidden="true" class="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 blur-2xl opacity-25 group-hover:opacity-40 transition duration-700 animate-pulse-fast pointer-events-none"></span>
    <span aria-hidden="true" class="absolute inset-0 rounded-full border border-white/20 animate-prismatic pointer-events-none"></span>
    <span aria-hidden="true" class="absolute left-1/2 top-1/2 w-16 h-16 bg-white/10 rounded-full blur-xl opacity-30 animate-core-glow pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"></span>
    <span aria-hidden="true" class="absolute left-[-75%] top-0 w-[150%] h-full bg-white/10 transform rotate-12 group-hover:animate-shine pointer-events-none"></span>
    <svg xmlns="http://www.w3.org/2000/svg" class="relative z-10 h-6 w-6 text-white drop-shadow-lg animate-flicker transition-transform duration-300 ease-in-out group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 10.5L12 3l9 7.5M4.5 10.5V20h15v-9.5" />
    </svg>
    <span class="relative z-10 hidden sm:inline">Accueil</span>
    <span aria-hidden="true" class="absolute -top-11 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-md shadow-lg opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none z-20">Retour à l'accueil</span>
  </a>

  <!-- Import du script d'authentification centralisé -->
  <script src="/api/auth.js"></script>
  <script>
    const backendUrl = "https://backend-v0em.onrender.com"; // Assurez-vous que c'est la bonne URL de votre backend Render

    document.addEventListener('DOMContentLoaded', async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let guildId = urlParams.get('serverId'); // Peut être null au premier chargement

      const accessToken = localStorage.getItem('discord_access_token');
      const mutualGuilds = JSON.parse(localStorage.getItem('mutualGuilds'));

      const guildNameSpan = document.getElementById('guild-name');
      const serverSidebar = document.getElementById('server-sidebar'); // Nouvelle sidebar des serveurs

      const collectRolesList = document.getElementById('collect-roles-list');
      const addCollectRoleForm = document.getElementById('add-collect-role-form');
      const addCollectRoleStatus = document.getElementById('add-collect-role-status');
      const collectRoleSelect = document.getElementById('collect-role-select');

      const generalEmbedsForm = document.getElementById('general-embeds-form');
      const generalEmbedsStatus = document.getElementById('general-embeds-status');
      const currencyForm = document.getElementById('currency-form');
      const currencyStatus = document.getElementById('currency-status');
      const bonusCommandForm = document.getElementById('bonus-command-form');
      const bonusCommandStatus = document.getElementById('bonus-command-status');
      const questCommandForm = document.getElementById('quest-command-form');
      const questCommandStatus = document.getElementById('quest-command-status');
      const riskCommandForm = document.getElementById('risk-command-form');
      const riskCommandStatus = document.getElementById('risk-command-status');

      const shopItemsList = document.getElementById('shop-items-list');
      const addNewItemBtn = document.getElementById('add-new-item-btn');
      const itemFormContainer = document.getElementById('item-form-container');
      const itemFormTitle = document.getElementById('item-form-title');
      const shopItemForm = document.getElementById('shop-item-form');
      const shopItemStatus = document.getElementById('shop-item-status');
      const itemIdHidden = document.getElementById('item-id-hidden');

      // Nouveaux éléments pour la gestion de l'image/emoji
      const itemImageValueInput = document.getElementById('item-image-value');
      const itemImageHelpText = document.getElementById('item-image-help-text');
      const emojiPreviewContainer = document.getElementById('emoji-preview-container');
      const emojiPreviewImg = document.getElementById('emoji-preview');
      const emojiTextPreview = document.getElementById('emoji-text-preview');

      const itemRequirementsContainer = document.getElementById('item-requirements-container');
      const addRequirementBtn = document.getElementById('add-requirement-btn');
      const itemOnUseRequirementsContainer = document.getElementById('item-on-use-requirements-container'); // Nouveau
      const addOnUseRequirementBtn = document.getElementById('add-on-use-requirement-btn'); // Nouveau
      const itemOnPurchaseActionsContainer = document.getElementById('item-on-purchase-actions-container');
      const addOnPurchaseActionBtn = document.getElementById('add-on-purchase-action-btn');
      const itemOnUseActionsContainer = document.getElementById('item-on-use-actions-container');
      const addOnUseActionBtn = document.getElementById('add-on-use-action-btn');

      // Nouveaux éléments pour les jeux
      const gameTabButtons = document.querySelectorAll('.tabs-container [data-game-tab]');
      const gameTabContents = document.querySelectorAll('.game-tab-content');

      const crashGameForm = document.getElementById('crash-game-form');
      const crashGameStatus = document.getElementById('crash-game-status');
      const plinkoGameForm = document.getElementById('plinko-game-form');
      const plinkoGameStatus = document.getElementById('plinko-game-status');
      const rouletteGameForm = document.getElementById('roulette-game-form');
      const rouletteGameStatus = document.getElementById('roulette-game-status');
      const diceGameForm = document.getElementById('dice-game-form');
      const diceGameStatus = document.getElementById('dice-game-status');

      // Nouveaux conteneurs pour les champs dynamiques des jeux
      const plinkoMultipliersContainer = document.getElementById('plinko-multipliers-container');
      const addPlinkoMultiplierBtn = document.getElementById('add-plinko-multiplier-btn');
      const rouletteOutcomesContainer = document.getElementById('roulette-outcomes-container');
      const addRouletteOutcomeBtn = document.getElementById('add-roulette-outcome-btn');

      // Nouveaux éléments pour l'onglet Permissions
      const adminRolesContainer = document.getElementById('admin-roles-container');
      const addAdminRoleBtn = document.getElementById('add-admin-role-btn');
      const commandTogglesContainer = document.getElementById('command-toggles-container');
      const permissionsForm = document.getElementById('permissions-form');
      const permissionsStatus = document.getElementById('permissions-status');


      let guildRoles = []; // Stockera les rôles du serveur pour les listes déroulantes
      let shopItems = []; // Stockera les items du shop pour les listes déroulantes (pour les exigences/actions d'items)

      // Cache pour les paramètres d'économie et de jeu
      const settingsCache = {
        economy: null,
        games: null,
        permissions: null, // Nouveau cache pour les permissions
        timestamp: 0 // Timestamp de la dernière mise à jour du cache
      };
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes de validité du cache

      const sections = {
        'economy': document.getElementById('economy-section'),
        'moderation': document.getElementById('moderation-section'),
        'logs': document.getElementById('logs-section')
      };

      const sidebarLinks = document.querySelectorAll('.sidebar-sections .sidebar-link'); // Cibler la sidebar des sections

      function showSection(sectionId) {
        Object.values(sections).forEach(section => section.classList.add('hidden'));
        sections[sectionId].classList.remove('hidden');
        sidebarLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`.sidebar-sections .sidebar-link[data-section="${sectionId}"]`).classList.add('active');
      }

      sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showSection(link.dataset.section);
        });
      });

      showSection('economy');

      // --- Logique des Onglets d'Économie ---
      const tabButtons = document.querySelectorAll('.tabs-container .tab-button[data-tab]');
      const tabContents = document.querySelectorAll('.tab-content');

      async function showTab(tabId) {
        if (!tabId) {
          console.error('showTab appelé avec un tabId invalide:', tabId);
          return;
        }
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons.forEach(button => button.classList.remove('active'));

        const targetButton = document.querySelector(`.tabs-container .tab-button[data-tab="${tabId}"]`);
        if (targetButton) {
          document.getElementById(tabId).classList.add('active');
          targetButton.classList.add('active');
          // Charger les données spécifiques à l'onglet si nécessaire
          if (tabId === 'economy-shop') {
            await loadShopItems();
          } else if (tabId === 'economy-games') {
            await loadGameSettings();
          } else if (tabId === 'economy-permissions') { // NOUVEAU
            await loadPermissionsSettings();
          }
        } else {
          console.error(`Tab button with data-tab="${tabId}" not found.`);
        }
      }

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.dataset.tab;
          if (tabId) {
            showTab(tabId);
          } else {
            console.error('Bouton d\'onglet sans data-tab détecté.');
          }
        });
      });


      showTab('economy-general');
      // --- Fin Logique des Onglets d'Économie ---

      // --- Logique des Onglets de Jeux ---
      function showGameTab(tabId) {
        gameTabContents.forEach(content => content.classList.add('hidden'));
        gameTabButtons.forEach(button => button.classList.remove('active'));

        const targetGameButton = document.querySelector(`.tabs-container [data-game-tab="${tabId}"]`);
        if (targetGameButton) { // Ajout de la vérification ici
          document.getElementById(tabId).classList.remove('hidden');
          targetGameButton.classList.add('active');
        } else {
          console.error(`Game tab button with data-game-tab="${tabId}" not found.`);
        }
      }

      gameTabButtons.forEach(button => {
        button.addEventListener('click', () => {
          showGameTab(button.dataset.gameTab);
        });
      });
      showGameTab('game-crash'); // Afficher le premier onglet de jeu par défaut
      // --- Fin Logique des Onglets de Jeux ---


      // --- Logique de la Sidebar des Serveurs ---
      function loadServerSidebar(guilds) {
        serverSidebar.innerHTML = '';
        // La vérification des permissions est maintenant faite par auth.js et le backend
        // Ici, on filtre juste pour s'assurer que le bot est présent et que l'utilisateur a les droits
        const filteredGuilds = guilds.filter(g => g.isInServer && (g.isOwner || g.hasAdminPerms));

        if (filteredGuilds.length === 0) {
          serverSidebar.innerHTML = '<p class="text-gray-400 text-xs p-2">Aucun serveur gérable.</p>';
          return;
        }

        filteredGuilds.forEach(guild => {
          const iconUrl = guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(guild.id.slice(-1)) % 5}.png`;

          const guildElement = document.createElement('div');
          guildElement.classList.add('server-icon-wrapper');
          guildElement.dataset.guildId = guild.id;
          guildElement.innerHTML = `
            <img src="${iconUrl}" alt="${guild.name} icon" class="server-icon">
            <span class="tooltip">${guild.name}</span>
          `;

          guildElement.addEventListener('click', async () => {
            // Mettre à jour l'ID du serveur actif
            guildId = guild.id;
            // Mettre à jour l'URL pour refléter le serveur sélectionné
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('serverId', guildId);
            window.history.replaceState({}, '', newUrl.toString());

            // Mettre à jour le nom du serveur affiché
            guildNameSpan.textContent = guild.name;

            // Mettre à jour l'état actif des icônes
            document.querySelectorAll('.server-icon-wrapper').forEach(el => el.classList.remove('active'));
            guildElement.classList.add('active');

            // Réinitialiser le cache lors du changement de serveur
            settingsCache.economy = null;
            settingsCache.games = null;
            settingsCache.permissions = null; // Réinitialiser le cache des permissions
            settingsCache.timestamp = 0;

            // Recharger tous les paramètres pour le nouveau serveur
            await loadGuildRoles(); // Recharger les rôles pour le nouveau serveur
            await loadEconomySettings(); // Recharger les paramètres d'économie
            // Ne pas charger les paramètres de jeu ici, ils seront chargés via l'onglet
            // if (document.getElementById('economy-games').classList.contains('active')) {
            //   await loadGameSettings(); // Recharger les paramètres des jeux si l'onglet est actif
            // }
            // if (document.getElementById('economy-shop').classList.contains('active')) {
            //   await loadShopItems(); // Recharger les items du shop si l'onglet est actif
            // }
            // if (document.getElementById('economy-permissions').classList.contains('active')) { // NOUVEAU
            //   await loadPermissionsSettings(); // Recharger les permissions si l'onglet est actif
            // }
          });
          serverSidebar.appendChild(guildElement);
        });

        // Si aucun guildId n'est dans l'URL, sélectionner le premier par default
        if (!guildId && filteredGuilds.length > 0) {
          guildId = filteredGuilds[0].id;
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('serverId', guildId);
          window.history.replaceState({}, '', newUrl.toString());
        }

        // Activer l'icône du serveur actuellement sélectionné
        if (guildId) {
          const activeGuildElement = document.querySelector(`.server-icon-wrapper[data-guild-id="${guildId}"]`);
          if (activeGuildElement) {
            activeGuildElement.classList.add('active');
            // Mettre à jour le nom du serveur au chargement initial
            const currentGuildData = filteredGuilds.find(g => g.id === guildId);
            if (currentGuildData) {
              guildNameSpan.textContent = currentGuildData.name;
            }
          }
        }
      }

      // Vérifier l'authentification et charger les serveurs
      if (!accessToken || !mutualGuilds) {
        alert("Non connecté ou données de serveurs manquantes. Redirection...");
        window.location.href = "./index.html"; // Rediriger vers la page de connexion
        return;
      }
      loadServerSidebar(mutualGuilds);
      // --- End Logique de la Sidebar des Serveurs ---


      // Vérifier si un guildId est sélectionné avant de charger les paramètres
      if (!guildId) {
        guildNameSpan.textContent = "Veuillez sélectionner un serveur";
        // Cacher les sections de paramètres si aucun serveur n'est sélectionné
        const economySection = document.getElementById('economy-section');
        const moderationSection = document.getElementById('moderation-section');
        const logsSection = document.getElementById('logs-section');

        if (economySection) economySection.classList.add('hidden');
        if (moderationSection) moderationSection.classList.add('hidden');
        if (logsSection) logsSection.classList.add('hidden');
        return; // Arrêter l'exécution si pas de serveur
      }

      // --- Fonctions de conversion Cooldown ---
      function secondsToDhms(seconds) {
        const d = Math.floor(seconds / (3600 * 24));
        seconds -= d * 3600 * 24;
        const h = Math.floor(seconds / 3600);
        seconds -= h * 3600;
        const m = Math.floor(seconds / 60);
        seconds -= m * 60;
        const s = seconds;
        return { d, h, m, s };
      }

      function dhmsToSeconds(d, h, m, s) {
        return (d * 3600 * 24) + (h * 3600) + (m * 60) + s;
      }

      function setCooldownInputs(prefix, totalSeconds) {
        const { d, h, m, s } = secondsToDhms(totalSeconds);
        const daysInput = document.getElementById(`${prefix}-days`);
        const hoursInput = document.getElementById(`${prefix}-hours`);
        const minutesInput = document.getElementById(`${prefix}-minutes`);
        const secondsInput = document.getElementById(`${prefix}-seconds`);

        if (daysInput) daysInput.value = d;
        if (hoursInput) hoursInput.value = h;
        if (minutesInput) minutesInput.value = m;
        if (secondsInput) secondsInput.value = s;
      }

      function getCooldownSeconds(prefix) {
        const daysInput = document.getElementById(`${prefix}-days`);
        const hoursInput = document.getElementById(`${prefix}-hours`);
        const minutesInput = document.getElementById(`${prefix}-minutes`);
        const secondsInput = document.getElementById(`${prefix}-seconds`);

        const d = parseInt(daysInput ? daysInput.value : '0') || 0;
        const h = parseInt(hoursInput ? hoursInput.value : '0') || 0;
        const m = parseInt(minutesInput ? minutesInput.value : '0') || 0;
        const s = parseInt(secondsInput ? secondsInput.value : '0') || 0;
        return dhmsToSeconds(d, h, m, s);
      }
      // --- Fin Fonctions de conversion Cooldown ---

      // --- Fonctions de gestion des rôles du serveur ---
      async function loadGuildRoles() {
        if (!guildId) return;
        try {
          const rolesResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/roles`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
          });
          if (!rolesResponse.ok) {
            // Si le backend renvoie une erreur de permission, rediriger
            if (rolesResponse.status === 403) {
              alert("Vous n'avez pas les permissions nécessaires pour gérer ce serveur.");
              window.location.href = "./serveur.html";
              return;
            }
            throw new Error(`Échec du chargement des rôles. Statut: ${rolesResponse.status}`);
          }
          guildRoles = await rolesResponse.json();
          populateRoleSelects();
        } catch (err) {
          console.error("Error loading guild roles:", err);
          if (collectRoleSelect) collectRoleSelect.innerHTML = '<option value="">Erreur de chargement des rôles</option>';
        }
      }

      function populateRoleSelects() {
        // Pour les rôles de collect
        if (collectRoleSelect) {
          collectRoleSelect.innerHTML = '<option value="">Sélectionner un rôle</option>';
          guildRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            collectRoleSelect.appendChild(option);
          });
        }

        // Pour les rôles dans le shop (requirements/actions)
        // Cette fonction sera appelée dynamiquement lors de la création de ces selects
      }

      function createRoleSelectElement(selectedValue = '') {
        const select = document.createElement('select');
        select.classList.add('w-full', 'p-2', 'rounded', 'bg-gray-600', 'border', 'border-gray-500', 'text-white', 'custom-select'); // Added custom-select
        select.innerHTML = '<option value="">Sélectionner un rôle</option>';
        guildRoles.forEach(role => {
          const option = document.createElement('option');
          option.value = role.id;
          option.textContent = role.name;
          option.style.color = role.color === '#000000' ? '#FFFFFF' : role.color; // Afficher la couleur du rôle
          if (role.id === selectedValue) {
            option.selected = true;
          }
          select.appendChild(option);
        });
        return select;
      }

      function createItemSelectElement(selectedValue = '') {
        const select = document.createElement('select');
        select.classList.add('w-full', 'p-2', 'rounded', 'bg-gray-600', 'border', 'border-gray-500', 'text-white', 'custom-select'); // Added custom-select
        select.innerHTML = '<option value="">Sélectionner un item</option>';
        shopItems.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id; // Use the actual DB ID
          option.textContent = item.name;
          if (item.id == selectedValue) { // Use == for comparison as item.id might be number and selectedValue string
            option.selected = true;
          }
          select.appendChild(option);
        });
        return select;
      }
      // --- Fin Fonctions de gestion des rôles du serveur ---

      // --- Fonction utilitaire pour les requêtes API avec retry ---
      async function makeApiRequest(url, options, retries = 3, delay = 1000) {
        try {
          const response = await fetch(url, options);
          if (response.status === 429 && retries > 0) {
            console.warn(`Received 429 for ${url}. Retrying in ${delay / 1000}s... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, delay));
            return makeApiRequest(url, options, retries - 1, delay * 2); // Exponential backoff
          }
          return response;
        } catch (error) {
          console.error(`API request failed for ${url}:`, error);
          throw error;
        }
      }
      // --- Fin Fonction utilitaire pour les requêtes API avec retry ---


      // Fonction pour charger TOUS les paramètres d'économie
      async function loadEconomySettings() {
        if (!guildId) return;

        // Invalider le cache des jeux et de l'économie lors du chargement des paramètres d'économie
        settingsCache.economy = null;
        settingsCache.games = null;
        settingsCache.permissions = null; // Invalider le cache des permissions
        settingsCache.timestamp = 0;

        // Vérifier le cache
        if (settingsCache.economy && (Date.now() - settingsCache.timestamp < CACHE_DURATION)) {
          console.log("Chargement des paramètres d'économie depuis le cache.");
          fillEconomyForms(settingsCache.economy);
          return;
        }

        try {
          const settingsResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
          });

          if (!settingsResponse.ok) {
            if (settingsResponse.status === 403) {
              alert("Vous n'avez pas les permissions nécessaires pour gérer ce serveur.");
              window.location.href = "./serveur.html";
              return;
            }
            throw new Error(`Échec du chargement des paramètres d'économie. Statut: ${settingsResponse.status}`);
          }

          const settings = await settingsResponse.json();
          settingsCache.economy = settings;
          settingsCache.timestamp = Date.now();
          fillEconomyForms(settings);

        } catch (err) {
          console.error("Error loading economy settings:", err);
          if (generalEmbedsStatus) showStatus(generalEmbedsStatus, `Erreur: ${err.message}`, false);
        }
      }

      // Fonction pour remplir les formulaires d'économie
      function fillEconomyForms(settings) {
        // Remplir les champs des paramètres Généraux / Embeds
        if (document.getElementById('balance-embed-color')) document.getElementById('balance-embed-color').value = settings.general_embeds.balance_embed_color;
        if (document.getElementById('balance-embed-color-text')) document.getElementById('balance-embed-color-text').value = settings.general_embeds.balance_embed_color;
        if (document.getElementById('collect-embed-color')) document.getElementById('collect-embed-color').value = settings.general_embeds.collect_embed_color;
        if (document.getElementById('collect-embed-color-text')) document.getElementById('collect-embed-color-text').value = settings.general_embeds.collect_embed_color;

        // Remplir les champs des paramètres de Monnaie
        if (document.getElementById('currency-name')) document.getElementById('currency-name').value = settings.currency.name;
        if (document.getElementById('currency-symbol')) document.getElementById('currency-symbol').value = settings.currency.symbol;

        // Remplir les champs des paramètres de la commande /bonus
        if (document.getElementById('bonus-embed-color')) document.getElementById('bonus-embed-color').value = settings.bonus_command.embed_color;
        if (document.getElementById('bonus-embed-color-text')) document.getElementById('bonus-embed-color-text').value = settings.bonus_command.embed_color;
        if (document.getElementById('bonus-success-message')) document.getElementById('bonus-success-message').value = settings.bonus_command.success_message;
        setCooldownInputs('bonus-cooldown', settings.bonus_command.cooldown);
        if (document.getElementById('bonus-min-gain')) document.getElementById('bonus-min-gain').value = settings.bonus_command.min_gain;
        if (document.getElementById('bonus-max-gain')) document.getElementById('bonus-max-gain').value = settings.bonus_command.max_gain;

        // Remplir les champs des paramètres de la commande /quest
        if (document.getElementById('quest-embed-color')) document.getElementById('quest-embed-color').value = settings.quest_command.embed_color;
        if (document.getElementById('quest-embed-color-text')) document.getElementById('quest-embed-color-text').value = settings.quest_command.embed_color;
        if (document.getElementById('quest-success-message')) document.getElementById('quest-success-message').value = settings.quest_command.success_message;
        if (document.getElementById('quest-unsuccess-message')) document.getElementById('quest-unsuccess-message').value = settings.quest_command.unsuccess_message;
        setCooldownInputs('quest-cooldown', settings.quest_command.cooldown);
        if (document.getElementById('quest-min-positive')) document.getElementById('quest-min-positive').value = settings.quest_command.min_positive;
        if (document.getElementById('quest-max-positive')) document.getElementById('quest-max-positive').value = settings.quest_command.max_positive;
        if (document.getElementById('quest-min-negative')) document.getElementById('quest-min-negative').value = settings.quest_command.min_negative;
        if (document.getElementById('quest-max-negative')) document.getElementById('quest-max-negative').value = settings.quest_command.max_negative;

        // Remplir les champs des paramètres de la commande /risk
        if (document.getElementById('risk-embed-color')) document.getElementById('risk-embed-color').value = settings.risk_command.embed_color;
        if (document.getElementById('risk-embed-color-text')) document.getElementById('risk-embed-color-text').value = settings.risk_command.embed_color;
        if (document.getElementById('risk-success-message')) document.getElementById('risk-success-message').value = settings.risk_command.success_message;
        if (document.getElementById('risk-unsuccess-message')) document.getElementById('risk-unsuccess-message').value = settings.risk_command.unsuccess_message;
        setCooldownInputs('risk-cooldown', settings.risk_command.cooldown);
        if (document.getElementById('risk-min-positive')) document.getElementById('risk-min-positive').value = settings.risk_command.min_positive;
        if (document.getElementById('risk-max-positive')) document.getElementById('risk-max-positive').value = settings.risk_command.max_positive;
        if (document.getElementById('risk-min-negative')) document.getElementById('risk-min-negative').value = settings.risk_command.min_negative;
        if (document.getElementById('risk-max-negative')) document.getElementById('risk-max-negative').value = settings.risk_command.max_negative;


        // Afficher les rôles de collect
        if (collectRolesList) collectRolesList.innerHTML = '';
        if (settings.collect_roles && settings.collect_roles.length > 0) {
          settings.collect_roles.forEach(role => {
            const roleItem = document.createElement('div');
            roleItem.classList.add('role-item');
            const roleData = guildRoles.find(r => r.id === role.role_id);
            const roleName = roleData?.name || `ID: ${role.role_id}`;
            const roleColor = roleData?.color && roleData.color !== '#000000' ? roleData.color : '#FFFFFF'; // Default to white if no color or black
            const { d, h, m, s } = secondsToDhms(role.cooldown);
            roleItem.innerHTML = `
                      <span class="role-name-display">
                          <span class="role-color-dot" style="background-color: ${roleColor};"></span>
                          ${roleName} | Montant: ${role.amount} | Cooldown: ${d}j ${h}h ${m}m ${s}s
                      </span>
                      <button data-role-id="${role.role_id}">Supprimer</button>
                  `;
            if (collectRolesList) collectRolesList.appendChild(roleItem);
          });
        } else {
          if (collectRolesList) collectRolesList.innerHTML = '<p class="text-gray-400">Aucun rôle de collect configuré.</p>';
        }
        // Cacher tous les messages de statut précédents
        if (generalEmbedsStatus) generalEmbedsStatus.classList.add('hidden');
        if (currencyStatus) currencyStatus.classList.add('hidden');
        if (bonusCommandStatus) bonusCommandStatus.classList.add('hidden');
        if (questCommandStatus) questCommandStatus.classList.add('hidden');
        if (riskCommandStatus) riskCommandStatus.classList.add('hidden');
      }


      // Fonctions pour les champs dynamiques de Plinko
      function addPlinkoMultiplierField(value = '') {
        const div = document.createElement('div');
        div.classList.add('dynamic-input-group', 'flex', 'items-center', 'gap-2');
        div.innerHTML = `
              <input type="number" step="0.01" min="0" value="${value}" class="flex-grow p-2 rounded bg-gray-600 border border-gray-500 text-white plinko-multiplier-input" placeholder="Multiplicateur">
              <button type="button" class="remove-btn">X</button>
          `;
        div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
        if (plinkoMultipliersContainer) plinkoMultipliersContainer.appendChild(div);
      }

      function getPlinkoMultipliers() {
        const multipliers = [];
        if (plinkoMultipliersContainer) {
          plinkoMultipliersContainer.querySelectorAll('.plinko-multiplier-input').forEach(input => {
            const value = parseFloat(input.value);
            if (!isNaN(value) && value >= 0) {
              multipliers.push(value);
            }
          });
        }
        return multipliers;
      }

      if (addPlinkoMultiplierBtn) addPlinkoMultiplierBtn.addEventListener('click', () => addPlinkoMultiplierField());

      // Fonctions pour les champs dynamiques de Roulette
      function addRouletteOutcomeField(outcome = { name: '', color: '#000000', multiplier: 1, numbers: '' }) {
        const div = document.createElement('div');
        div.classList.add('dynamic-input-group', 'space-y-2', 'roulette-outcome-item'); // Ajout de la classe roulette-outcome-item
        div.innerHTML = `
              <div class="flex items-center gap-2">
                  <label class="w-1/4">Nom du pari:</label>
                  <input type="text" value="${outcome.name}" class="flex-grow p-2 rounded bg-gray-600 border border-gray-500 text-white roulette-name-input" placeholder="Ex: Rouge, Pair, 0">
              </div>
              <div class="flex items-center gap-2">
                  <label class="w-1/4">Couleur:</label>
                  <div class="color-picker-wrapper flex-grow">
                      <input type="color" value="${outcome.color}" class="roulette-color-input">
                      <input type="text" value="${outcome.color}" class="color-hex-input flex-grow roulette-color-text-input" placeholder="#RRGGBB">
                  </div>
              </div>
              <div class="flex items-center gap-2">
                  <label class="w-1/4">Multiplicateur:</label>
                  <input type="number" min="0.01" step="0.01" value="${outcome.multiplier}" class="flex-grow p-2 rounded bg-gray-600 border border-gray-500 text-white roulette-multiplier-input">
              </div>
              <div class="flex items-center gap-2">
                  <label class="w-1/4">Numéros (séparés par des virgules):</label>
                  <input type="text" value="${outcome.numbers}" class="flex-grow p-2 rounded bg-gray-600 border border-gray-500 text-white roulette-numbers-input" placeholder="Ex: 1,3,5 ou 0,2,4,...">
              </div>
              <button type="button" class="remove-btn float-right">X</button>
          `;

        // Setup color pickers for dynamic fields
        const colorInput = div.querySelector('.roulette-color-input');
        const colorTextInput = div.querySelector('.roulette-color-text-input');
        if (colorInput && colorTextInput) {
          setupColorPickerForDynamicField(colorInput, colorTextInput);
        }

        div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
        if (rouletteOutcomesContainer) rouletteOutcomesContainer.appendChild(div);
      }

      function setupColorPickerForDynamicField(colorInput, textInput) {
        // Initialisation de la couleur du texte si elle est vide ou non hexadécimale
        if (!/^#([0-9A-F]{3}){1,2}$/i.test(textInput.value)) {
          textInput.value = colorInput.value; // Assure que le champ texte a une valeur hex valide
        }

        colorInput.addEventListener('input', () => {
          textInput.value = colorInput.value;
        });
        textInput.addEventListener('input', () => {
          // Valide le format hexadécimal avant de mettre à jour le color picker
          if (/^#([0-9A-F]{3}){1,2}$/i.test(textInput.value)) {
            colorInput.value = textInput.value;
          }
        });
      }

      function getRouletteOutcomes() {
        const outcomes = [];
        if (rouletteOutcomesContainer) {
          rouletteOutcomesContainer.querySelectorAll('.roulette-outcome-item').forEach(div => { // Utiliser la nouvelle classe
            const name = div.querySelector('.roulette-name-input')?.value;
            const color = div.querySelector('.roulette-color-input')?.value;
            const multiplier = parseFloat(div.querySelector('.roulette-multiplier-input')?.value);
            const numbersStr = div.querySelector('.roulette-numbers-input')?.value;
            const numbers = numbersStr ? numbersStr.split(',').map(n => {
              const trimmed = n.trim();
              return trimmed === '' ? null : parseInt(trimmed); // Handle empty strings from split
            }).filter(n => n !== null && !isNaN(n)) : [];

            if (name && color && !isNaN(multiplier) && numbers.length > 0) {
              outcomes.push({ name, color, multiplier, numbers });
            }
          });
        }
        return outcomes;
      }

      if (addRouletteOutcomeBtn) addRouletteOutcomeBtn.addEventListener('click', () => addRouletteOutcomeField());


      // Charger les paramètres des jeux
      async function loadGameSettings() {
        if (!guildId) return;

        // Vérifier le cache
        if (settingsCache.games && (Date.now() - settingsCache.timestamp < CACHE_DURATION)) {
          console.log("Chargement des paramètres de jeu depuis le cache.");
          fillGameForms(settingsCache.games);
          return;
        }

        try {
          const settingsResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
          });
          if (!settingsResponse.ok) {
            throw new Error(`Failed to load game settings. Status: ${settingsResponse.status}`);
          }
          const settings = await settingsResponse.json();
          settingsCache.games = settings; // Mettre en cache les paramètres de jeu
          settingsCache.timestamp = Date.now(); // Mettre à jour le timestamp
          fillGameForms(settings);

        } catch (err) {
          console.error("Error loading game settings:", err);
          if (crashGameStatus) showStatus(crashGameStatus, `Erreur lors du chargement des paramètres de jeu: ${err.message}`, false);
        }
      }

      // Fonction pour remplir les formulaires de jeu
      function fillGameForms(settings) {
        // Crash Game
        if (document.getElementById('crash-embed-color')) document.getElementById('crash-embed-color').value = settings.crash_game?.embed_color || '#FF0000';
        if (document.getElementById('crash-embed-color-text')) document.getElementById('crash-embed-color-text').value = settings.crash_game?.embed_color || '#FF0000';
        if (document.getElementById('crash-min-bet')) document.getElementById('crash-min-bet').value = settings.crash_game?.min_bet || 1;
        if (document.getElementById('crash-max-bet')) document.getElementById('crash-max-bet').value = settings.crash_game?.max_bet || 1000;
        if (document.getElementById('crash-min-multiplier')) document.getElementById('crash-min-multiplier').value = settings.crash_game?.min_multiplier || 1.01;
        if (document.getElementById('crash-max-multiplier')) document.getElementById('crash-max-multiplier').value = settings.crash_game?.max_multiplier || 100;
        if (document.getElementById('crash-crash-chance')) document.getElementById('crash-crash-chance').value = settings.crash_game?.crash_chance || 50;

        // Plinko
        if (document.getElementById('plinko-embed-color')) document.getElementById('plinko-embed-color').value = settings.plinko_game?.embed_color || '#00FF00';
        if (document.getElementById('plinko-embed-color-text')) document.getElementById('plinko-embed-color-text').value = settings.plinko_game?.embed_color || '#00FF00';
        if (document.getElementById('plinko-min-bet')) document.getElementById('plinko-min-bet').value = settings.plinko_game?.min_bet || 1;
        if (document.getElementById('plinko-max-bet')) document.getElementById('plinko-max-bet').value = settings.plinko_game?.max_bet || 500;
        if (document.getElementById('plinko-rows')) document.getElementById('plinko-rows').value = settings.plinko_game?.rows || 8;

        // Charger les multiplicateurs Plinko
        if (plinkoMultipliersContainer) plinkoMultipliersContainer.innerHTML = ''; // Nettoyer avant de recharger
        if (settings.plinko_game?.multipliers && Array.isArray(settings.plinko_game.multipliers)) {
          settings.plinko_game.multipliers.forEach(m => addPlinkoMultiplierField(m));
        } else {
          // Ajouter les multiplicateurs par défaut si non configurés
          // Pour 8 lignes, il faut 9 multiplicateurs.
          [0.5, 1, 1.5, 2, 3, 5, 10, 5, 3].forEach(m => addPlinkoMultiplierField(m));
        }

        // Roulette
        if (document.getElementById('roulette-embed-color')) document.getElementById('roulette-embed-color').value = settings.roulette_game?.embed_color || '#0000FF';
        if (document.getElementById('roulette-embed-color-text')) document.getElementById('roulette-embed-color-text').value = settings.roulette_game?.embed_color || '#0000FF';
        if (document.getElementById('roulette-min-bet')) document.getElementById('roulette-min-bet').value = settings.roulette_game?.min_bet || 1;
        if (document.getElementById('roulette-max-bet')) document.getElementById('roulette-max-bet').value = settings.roulette_game?.max_bet || 2000;

        // Charger les résultats de Roulette
        if (rouletteOutcomesContainer) rouletteOutcomesContainer.innerHTML = ''; // Nettoyer avant de recharger
        if (settings.roulette_game?.outcomes && Array.isArray(settings.roulette_game.outcomes)) {
          settings.roulette_game.outcomes.forEach(o => addRouletteOutcomeField({
            name: o.name,
            color: o.color,
            multiplier: o.multiplier,
            numbers: o.numbers.join(',') // Convertir le tableau en chaîne pour l'input
          }));
        } else {
          // Ajouter les résultats par défaut si non configurés
          [
            { "name": "Rouge", "color": "#FF0000", "multiplier": 2, "numbers": [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36] },
            { "name": "Noir", "color": "#000000", "multiplier": 2, "numbers": [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35] },
            { "name": "Vert (0)", "color": "#008000", "multiplier": 14, "numbers": [0] }
          ].forEach(o => addRouletteOutcomeField({
            name: o.name,
            color: o.color,
            multiplier: o.multiplier,
            numbers: o.numbers.join(',')
          }));
        }

        // Dice Roll
        if (document.getElementById('dice-embed-color')) document.getElementById('dice-embed-color').value = settings.dice_game?.embed_color || '#FFFF00';
        if (document.getElementById('dice-embed-color-text')) document.getElementById('dice-embed-color-text').value = settings.dice_game?.embed_color || '#FFFF00';
        if (document.getElementById('dice-min-bet')) document.getElementById('dice-min-bet').value = settings.dice_game?.min_bet || 1;
        if (document.getElementById('dice-max-bet')) document.getElementById('dice-max-bet').value = settings.dice_game?.max_bet || 100;
        if (document.getElementById('dice-min-roll')) document.getElementById('dice-min-roll').value = settings.dice_game?.min_roll || 1;
        if (document.getElementById('dice-max-roll')) document.getElementById('dice-max-roll').value = settings.dice_game?.max_roll || 99;

        // Cacher tous les messages de statut précédents
        if (crashGameStatus) crashGameStatus.classList.add('hidden');
        if (plinkoGameStatus) plinkoGameStatus.classList.add('hidden');
        if (rouletteGameStatus) rouletteGameStatus.classList.add('hidden');
        if (diceGameStatus) diceGameStatus.classList.add('hidden');
      }

      // NOUVELLES FONCTIONS POUR L'ONGLET PERMISSIONS
      async function loadPermissionsSettings() {
        if (!guildId) return;

        // Vérifier le cache
        if (settingsCache.permissions && (Date.now() - settingsCache.timestamp < CACHE_DURATION)) {
          console.log("Chargement des paramètres de permissions depuis le cache.");
          fillPermissionsForms(settingsCache.permissions);
          return;
        }

        try {
          const settingsResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
          });
          if (!settingsResponse.ok) {
            throw new Error(`Failed to load permissions settings. Status: ${settingsResponse.status}`);
          }
          const settings = await settingsResponse.json();
          settingsCache.permissions = settings; // Mettre en cache les paramètres de permissions
          settingsCache.timestamp = Date.now(); // Mettre à jour le timestamp
          fillPermissionsForms(settings);

        } catch (err) {
          console.error("Error loading permissions settings:", err);
          if (permissionsStatus) showStatus(permissionsStatus, `Erreur lors du chargement des permissions: ${err.message}`, false);
        }
      }

      function fillPermissionsForms(settings) {
        // Remplir les rôles administrateurs d'économie
        if (adminRolesContainer) adminRolesContainer.innerHTML = '';
        const adminRoles = settings.permissions?.admin_roles || [];
        adminRoles.forEach(roleId => addAdminRoleField(roleId));

        // Remplir les toggles de commandes
        if (commandTogglesContainer) commandTogglesContainer.innerHTML = '';
        const commandStates = settings.permissions?.command_states || {};

        const economyCommands = [
          { name: "item_info", description: "Afficher les informations d'un item." },
          { name: "inventory", description: "Afficher l'inventaire d'un utilisateur." },
          { name: "shop", description: "Accéder au magasin." },
          { name: "balance", description: "Afficher la balance d'un utilisateur." },
          { name: "withdraw", description: "Retirer de l'argent de la banque." },
          { name: "deposit", description: "Déposer de l'argent à la banque." },
          { name: "buy", description: "Acheter un article du magasin." },
          { name: "use", description: "Utiliser un article de l'inventaire." },
          { name: "sell", description: "Vendre un item de l'inventaire." },
          { name: "bonus", description: "Utiliser la commande bonus." },
          { name: "risk", description: "Prendre un risque." },
          { name: "quest", description: "Tenter une quête." },
          { name: "plinko", description: "Jouer au Plinko." },
          { name: "crash", description: "Jouer au Crash Game." },
          { name: "roulette", description: "Jouer à la Roulette." },
          { name: "dice", description: "Jouer au Dice Roll." },
          { name: "add-money", description: "Ajouter de l'argent à un utilisateur (Admin)." },
          { name: "remove-money", description: "Retirer de l'argent à un utilisateur (Admin)." },
          { name: "add-ineventory", description: "Ajouter un item à l'inventaire d'un utilisateur (Admin)." },
          { name: "remove-inventory", description: "Retirer un item de l'inventaire d'un utilisateur (Admin)." },
          { name: "reset-money", description: "Réinitialiser la monnaie de tous les joueurs du serveur (Admin)." },
          { name: "leaderboard", description: "Afficher le classement des richesses." },
          { name: "collect", description: "Collecter de l'argent via les rôles." },
        ];

        economyCommands.forEach(cmd => {
          const state = commandTogglesContainer.querySelector(`[data-command-name="${cmd.name}"]`);
          if (!state) { // Si le toggle n'existe pas encore, le créer
            addCommandToggle(cmd.name, cmd.description, commandStates[cmd.name] || { enabled: true, slash: true, prefix: true });
          } else { // Sinon, juste mettre à jour son état
            const enabledCheckbox = state.querySelector('.command-enabled-checkbox');
            const slashCheckbox = state.querySelector('.command-slash-checkbox');
            const prefixCheckbox = state.querySelector('.command-prefix-checkbox');

            const cmdState = commandStates[cmd.name] || { enabled: true, slash: true, prefix: true };
            if (enabledCheckbox) enabledCheckbox.checked = cmdState.enabled;
            if (slashCheckbox) slashCheckbox.checked = cmdState.slash;
            if (prefixCheckbox) prefixCheckbox.checked = cmdState.prefix;

            // Gérer l'état disabled des sous-checkboxes
            if (slashCheckbox) slashCheckbox.disabled = !cmdState.enabled;
            if (prefixCheckbox) prefixCheckbox.disabled = !cmdState.enabled;
          }
        });
      }

      function addAdminRoleField(roleId = '') {
        const div = document.createElement('div');
        div.classList.add('dynamic-input-group', 'flex', 'items-center', 'gap-2');
        const roleSelect = createRoleSelectElement(roleId);
        roleSelect.setAttribute('name', 'admin-role-id');
        div.appendChild(roleSelect);
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('remove-btn');
        removeBtn.textContent = 'X';
        removeBtn.addEventListener('click', () => div.remove());
        div.appendChild(removeBtn);
        if (adminRolesContainer) adminRolesContainer.appendChild(div);
      }

      if (addAdminRoleBtn) addAdminRoleBtn.addEventListener('click', () => addAdminRoleField());

      function addCommandToggle(commandName, commandDescription, initialState) {
        const div = document.createElement('div');
        div.classList.add('command-toggle-group', 'p-4', 'bg-gray-700', 'rounded-lg', 'border', 'border-gray-600');
        div.dataset.commandName = commandName; // Pour faciliter la récupération des données

        const enabledId = `cmd-${commandName}-enabled`;
        const slashId = `cmd-${commandName}-slash`;
        const prefixId = `cmd-${commandName}-prefix`;

        div.innerHTML = `
          <div class="flex items-center justify-between mb-2">
            <label class="text-white font-semibold text-lg">${commandName}</label>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="${enabledId}" class="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 command-enabled-checkbox">
              <label for="${enabledId}" class="text-gray-300">Activée</label>
            </div>
          </div>
          <p class="text-gray-400 text-sm mb-3">${commandDescription}</p>
          <div class="flex items-center gap-4 ml-4">
            <div class="flex items-center gap-2">
              <input type="checkbox" id="${slashId}" class="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 command-slash-checkbox">
              <label for="${slashId}" class="text-gray-400">Slash Command (/) activée</label>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="${prefixId}" class="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 command-prefix-checkbox">
              <label for="${prefixId}" class="text-gray-400">Prefix Command (!) activée</label>
            </div>
          </div>
        `;

        const enabledCheckbox = div.querySelector(`#${enabledId}`);
        const slashCheckbox = div.querySelector(`#${slashId}`);
        const prefixCheckbox = div.querySelector(`#${prefixId}`);

        // Initialiser les états
        enabledCheckbox.checked = initialState.enabled;
        slashCheckbox.checked = initialState.slash;
        prefixCheckbox.checked = initialState.prefix;

        // Gérer l'état disabled des sous-checkboxes
        slashCheckbox.disabled = !initialState.enabled;
        prefixCheckbox.disabled = !initialState.enabled;

        enabledCheckbox.addEventListener('change', () => {
          slashCheckbox.disabled = !enabledCheckbox.checked;
          prefixCheckbox.disabled = !enabledCheckbox.checked;
          if (!enabledCheckbox.checked) {
            slashCheckbox.checked = false;
            prefixCheckbox.checked = false;
          } else {
            // Si on réactive la commande, on peut choisir de réactiver les deux par défaut ou laisser l'utilisateur choisir
            // Pour l'instant, on les réactive par défaut si la commande est activée
            slashCheckbox.checked = true;
            prefixCheckbox.checked = true;
          }
        });

        if (commandTogglesContainer) commandTogglesContainer.appendChild(div);
      }
      // FIN NOUVELLES FONCTIONS POUR L'ONGLET PERMISSIONS


      // Charger les paramètres seulement si un guildId est présent
      if (guildId) {
        await loadGuildRoles(); // Charger les rôles avant les paramètres pour qu'ils soient disponibles
        await loadEconomySettings();
        // loadGameSettings() n'est plus appelé ici, il sera appelé par l'activation de l'onglet "Jeux"
        // loadPermissionsSettings() n'est plus appelé ici, il sera appelé par l'activation de l'onglet "Permissions"
      }


      // --- Gestion des soumissions de formulaires ---

      // Fonction utilitaire pour afficher le statut
      function showStatus(element, message, isSuccess) {
        if (!element) {
          console.error("showStatus called with null element:", message);
          return;
        }
        element.textContent = message;
        element.classList.remove('hidden', 'success', 'error');
        element.classList.add(isSuccess ? 'success' : 'error');
        setTimeout(() => element.classList.add('hidden'), 5000); // Masquer après 5 secondes
      }

      // Fonction utilitaire pour synchroniser les inputs couleur
      function setupColorPicker(colorInputId, textInputId) {
        const colorInput = document.getElementById(colorInputId);
        const textInput = document.getElementById(textInputId);

        if (!colorInput || !textInput) return;

        // Sync color picker to text input
        colorInput.addEventListener('input', () => {
          textInput.value = colorInput.value;
        });

        // Sync text input to color picker
        textInput.addEventListener('input', () => {
          // Basic validation for hex color
          if (/^#([0-9A-F]{3}){1,2}$/i.test(textInput.value)) {
            colorInput.value = textInput.value;
          }
        });
      }

      // Initialiser les sélecteurs de couleur
      setupColorPicker('balance-embed-color', 'balance-embed-color-text');
      setupColorPicker('collect-embed-color', 'collect-embed-color-text');
      setupColorPicker('bonus-embed-color', 'bonus-embed-color-text');
      setupColorPicker('quest-embed-color', 'quest-embed-color-text');
      setupColorPicker('risk-embed-color', 'risk-embed-color-text');
      setupColorPicker('crash-embed-color', 'crash-embed-color-text'); // Nouveau
      setupColorPicker('plinko-embed-color', 'plinko-embed-color-text'); // Nouveau
      setupColorPicker('roulette-embed-color', 'roulette-embed-color-text'); // Nouveau
      setupColorPicker('dice-embed-color', 'dice-embed-color-text'); // Nouveau


      // Formulaire Général / Embeds
      if (generalEmbedsForm) generalEmbedsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (generalEmbedsStatus) generalEmbedsStatus.classList.add('hidden');

        const payload = {
          general_embeds: {
            balance_embed_color: document.getElementById('balance-embed-color')?.value || '#00ffcc',
            collect_embed_color: document.getElementById('collect-embed-color')?.value || '#00ffcc',
          }
        };

        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Échec de la sauvegarde des paramètres d'Embed.");
          }

          if (generalEmbedsStatus) showStatus(generalEmbedsStatus, "Paramètres d'Embed sauvegardés avec succès !", true);
          settingsCache.economy = null; // Invalider le cache
          await loadEconomySettings();

        } catch (err) {
          console.error("Error saving general embed settings:", err);
          if (generalEmbedsStatus) showStatus(generalEmbedsStatus, `Erreur: ${err.message}`, false);
        }
      });

      // Formulaire Monnaie
      if (currencyForm) currencyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currencyStatus) currencyStatus.classList.add('hidden');

        const payload = {
          currency: {
            name: document.getElementById('currency-name')?.value || 'Crédits',
            symbol: document.getElementById('currency-symbol')?.value || '💰'
          }
        };

        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Échec de la sauvegarde des paramètres de monnaie.");
          }

          if (currencyStatus) showStatus(currencyStatus, "Paramètres de monnaie sauvegardés avec succès !", true);
          settingsCache.economy = null; // Invalider le cache
          await loadEconomySettings();

        } catch (err) {
          console.error("Error saving currency settings:", err);
          if (currencyStatus) showStatus(currencyStatus, `Erreur: ${err.message}`, false);
        }
      });

      // Formulaire Commande /bonus
      if (bonusCommandForm) bonusCommandForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (bonusCommandStatus) bonusCommandStatus.classList.add('hidden');

        const payload = {
          bonus_command: {
            embed_color: document.getElementById('bonus-embed-color')?.value || '#00ffcc',
            success_message: document.getElementById('bonus-success-message')?.value || 'Félicitations ! Vous avez gagné {amount} !',
            cooldown: getCooldownSeconds('bonus-cooldown'),
            min_gain: parseInt(document.getElementById('bonus-min-gain')?.value || '100'),
            max_gain: parseInt(document.getElementById('bonus-max-gain')?.value || '500')
          }
        };

        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Échec de la sauvegarde des paramètres /bonus.");
          }

          if (bonusCommandStatus) showStatus(bonusCommandStatus, "Paramètres /bonus sauvegardés avec succès !", true);
          settingsCache.economy = null; // Invalider le cache
          await loadEconomySettings();

        } catch (err) {
          console.error("Error saving bonus command settings:", err);
          if (bonusCommandStatus) showStatus(bonusCommandStatus, `Erreur: ${err.message}`, false);
        }
      });

      // Formulaire Commande /quest
      if (questCommandForm) questCommandForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (questCommandStatus) questCommandStatus.classList.add('hidden');

        const payload = {
          quest_command: {
            embed_color: document.getElementById('quest-embed-color')?.value || '#00ffcc',
            success_message: document.getElementById('quest-success-message')?.value || 'Vous avez réussi la quête et gagné {amount} !',
            unsuccess_message: document.getElementById('quest-unsuccess-message')?.value || 'Vous avez échoué la quête et perdu {amount} !',
            cooldown: getCooldownSeconds('quest-cooldown'),
            min_positive: parseInt(document.getElementById('quest-min-positive')?.value || '20'),
            max_positive: parseInt(document.getElementById('quest-max-positive')?.value || '100'),
            min_negative: parseInt(document.getElementById('quest-min-negative')?.value || '-50'),
            max_negative: parseInt(document.getElementById('quest-max-negative')?.value || '-10')
          }
        };

        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Échec de la sauvegarde des paramètres /quest.");
          }

          if (questCommandStatus) showStatus(questCommandStatus, "Paramètres /quest sauvegardés avec succès !", true);
          settingsCache.economy = null; // Invalider le cache
          await loadEconomySettings();

        } catch (err) {
          console.error("Error saving quest command settings:", err);
          if (questCommandStatus) showStatus(questCommandStatus, `Erreur: ${err.message}`, false);
        }
      });

      // Formulaire Commande /risk
      if (riskCommandForm) riskCommandForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (riskCommandStatus) riskCommandStatus.classList.add('hidden');

        const payload = {
          risk_command: {
            embed_color: document.getElementById('risk-embed-color')?.value || '#00ffcc',
            success_message: document.getElementById('risk-success-message')?.value || 'Vous avez pris un risque et gagné {amount} !',
            unsuccess_message: document.getElementById('risk-unsuccess-message')?.value || 'Oh non ! Vous avez perdu {amount} !',
            cooldown: getCooldownSeconds('risk-cooldown'),
            min_positive: parseInt(document.getElementById('risk-min-positive')?.value || '500'),
            max_positive: parseInt(document.getElementById('risk-max-positive')?.value || '2000'),
            min_negative: parseInt(document.getElementById('risk-min-negative')?.value || '-200'),
            max_negative: parseInt(document.getElementById('risk-max-negative')?.value || '-50')
          }
        };

        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Échec de la sauvegarde des paramètres /risk.");
          }

          if (riskCommandStatus) showStatus(riskCommandStatus, "Paramètres /risk sauvegardés avec succès !", true);
          settingsCache.economy = null; // Invalider le cache
          await loadEconomySettings();

        } catch (err) {
          console.error("Error saving risk command settings:", err);
          if (riskCommandStatus) showStatus(riskCommandStatus, `Erreur: ${err.message}`, false);
        }
      });


      // Gérer la soumission du formulaire d'ajout de rôle de collect
      if (addCollectRoleForm) addCollectRoleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (addCollectRoleStatus) addCollectRoleStatus.classList.add('hidden');

        const roleId = collectRoleSelect?.value;
        const amount = parseInt(document.getElementById('collect-amount')?.value || '0');
        const cooldown = getCooldownSeconds('collect-cooldown');

        if (!roleId) {
          if (addCollectRoleStatus) showStatus(addCollectRoleStatus, "Veuillez sélectionner un rôle.", false);
          return;
        }

        try {
          const addResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy/collect_role`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ role_id: roleId, amount: amount, cooldown: cooldown })
          });

          if (!addResponse.ok) {
            const errorData = await addResponse.json();
            throw new Error(errorData.message || "Échec de l'ajout du rôle de collect.");
          }

          if (addCollectRoleStatus) showStatus(addCollectRoleStatus, "Rôle de collect ajouté avec succès !", true);
          if (addCollectRoleForm) addCollectRoleForm.reset();
          settingsCache.economy = null; // Invalider le cache
          await loadEconomySettings();

        } catch (err) {
          console.error("Error adding collect role:", err);
          if (addCollectRoleStatus) {
            if (err.message.includes("existe déjà")) {
              showStatus(addCollectRoleStatus, `Erreur: ${err.message}`, false);
            } else {
              showStatus(addCollectRoleStatus, `Erreur lors de l'ajout du rôle de collect.`, false);
            }
          }
        }
      });

      // Gérer la suppression d'un rôle de collect
      if (collectRolesList) collectRolesList.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.roleId) {
          const roleIdToDelete = e.target.dataset.roleId;
          if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle de collect avec l'ID ${roleIdToDelete} ?`)) {
            return;
          }

          try {
            const deleteResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy/collect_role/${roleIdToDelete}`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${accessToken}` }
            });

            if (!deleteResponse.ok) {
              const errorData = await deleteResponse.json();
              throw new Error(errorData.message || "Échec de la suppression du rôle de collect.");
            }

            if (generalEmbedsStatus) showStatus(generalEmbedsStatus, "Rôle de collect supprimé avec succès !", true);
            settingsCache.economy = null; // Invalider le cache
            await loadEconomySettings();

          } catch (err) {
              console.error("Error deleting collect role:", err);
              if (generalEmbedsStatus) {
                  if (err.message.includes("pas été trouvé")) {
                      showStatus(generalEmbedsStatus, `Erreur: ${err.message}`, false);
                  } else {
                      showStatus(generalEmbedsStatus, `Erreur lors de la suppression du rôle de collect.`, false);
                  }
              }
          }
        }
      });

      // --- Shop Item Management ---
      async function loadShopItems() {
        if (!guildId) return;
        try {
          const response = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/shop/items`, {
            headers: { "Authorization": `Bearer ${accessToken}` }
          });
          if (!response.ok) {
            // Gérer les erreurs de permission ici aussi
            if (response.status === 403) {
              alert("Vous n'avez pas les permissions nécessaires pour gérer ce serveur.");
              window.location.href = "./serveur.html";
              return;
            }
            throw new Error(`Failed to load shop items. Status: ${response.status}`);
          }
          shopItems = await response.json(); // Store items for item selects
          if (shopItemsList) shopItemsList.innerHTML = '';
          if (shopItems.length === 0) {
            if (shopItemsList) shopItemsList.innerHTML = '<p class="text-gray-400">Aucun article dans le magasin.</p>';
          } else {
            shopItems.forEach(item => {
              const itemCard = document.createElement('div');
              itemCard.classList.add('item-card');
              // Afficher l'emoji ou l'image
              let itemIconHtml = '';
              if (item.image_url) {
                // Vérifier si c'est une URL d'emoji Discord (png ou gif)
                const discordEmojiUrlMatch = item.image_url.match(/^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif)/);
                if (discordEmojiUrlMatch) {
                  itemIconHtml = `<img src="${item.image_url}" alt="${item.name}" />`;
                } else {
                  // C'est un emoji Unicode
                  itemIconHtml = `<div class="item-icon">${item.image_url}</div>`; // Changed to div for better styling
                }
              } else {
                itemIconHtml = `<div class="item-icon">📦</div>`; // Emoji par défaut si rien n'est défini
              }

              itemCard.innerHTML = `
                          ${itemIconHtml}
                          <div class="item-card-info">
                              <h4>${item.name} (ID: ${item.id}) (${item.price} ${document.getElementById('currency-symbol')?.value || '💰'})</h4>
                              <p class="text-gray-400 text-sm">${item.description || 'Pas de description.'}</p>
                              <p class="text-gray-500 text-xs">
                                  ${item.sellable ? 'Vendable' : ''} ${item.usable ? ' | Utilisable' : ''} ${item.inventory ? ' | Ajouté à l\'inventaire' : ''}
                                  ${item.unlimited_stock ? ' | Stock illimité' : (item.stock !== null ? ` | Stock: ${item.stock}` : '')}
                                  ${item.max_purchase_per_transaction !== null ? ` | Max par transaction: ${item.max_purchase_per_transaction}` : ''}
                              </p>
                          </div>
                          <div class="item-card-actions">
                              <button class="edit-btn" data-item-id="${item.id}">Modifier</button>
                              <button class="delete-btn" data-item-id="${item.id}">Supprimer</button>
                          </div>
                      `;
              if (shopItemsList) shopItemsList.appendChild(itemCard);
            });
          }
        } catch (err) {
          console.error("Error loading shop items:", err);
          if (shopItemsList) shopItemsList.innerHTML = `<p class="text-red-400">Erreur lors du chargement des articles du shop: ${err.message}</p>`;
        }
      }

      if (addNewItemBtn) addNewItemBtn.addEventListener('click', () => {
        if (itemFormContainer) itemFormContainer.classList.remove('hidden');
        if (itemFormTitle) itemFormTitle.textContent = 'Ajouter un article';
        if (shopItemForm) shopItemForm.reset();
        if (itemIdHidden) itemIdHidden.value = ''; // Clear hidden ID for new item
        if (document.getElementById('item-stock')) document.getElementById('item-stock').value = ''; // Clear stock
        if (document.getElementById('item-unlimited-stock')) {
          document.getElementById('item-unlimited-stock').checked = true; // Default to unlimited stock
          document.getElementById('item-stock').setAttribute('disabled', 'true'); // Disable stock input
        }
        if (document.getElementById('item-max-purchase-per-transaction')) document.getElementById('item-max-purchase-per-transaction').value = ''; // Clear max purchase
        if (itemRequirementsContainer) itemRequirementsContainer.innerHTML = ''; // Clear existing requirements
        if (itemOnUseRequirementsContainer) itemOnUseRequirementsContainer.innerHTML = ''; // Clear existing on use requirements
        if (itemOnPurchaseActionsContainer) itemOnPurchaseActionsContainer.innerHTML = ''; // Clear existing actions
        if (itemOnUseActionsContainer) itemOnUseActionsContainer.innerHTML = ''; // Clear existing actions
        if (shopItemStatus) shopItemStatus.classList.add('hidden');

        // Réinitialiser l'input image/emoji et l'aperçu
        if (itemImageValueInput) itemImageValueInput.value = '';
        updateEmojiPreview('');
      });

      // Fonction pour mettre à jour l'aperçu de l'emoji
      function updateEmojiPreview(value) {
        if (emojiPreviewImg) emojiPreviewImg.classList.add('hidden');
        if (emojiTextPreview) emojiTextPreview.classList.add('hidden');
        if (emojiPreviewImg) emojiPreviewImg.src = '';
        if (emojiTextPreview) emojiTextPreview.textContent = '';

        // Regex pour emoji personnalisé Discord (statique ou animé)
        const customEmojiMatch = value.match(/<?(a)?:?(\w+):(\d+)>?/);
        // Regex pour URL d'emoji Discord (y compris .webp et paramètres de taille/animation)
        const discordEmojiUrlMatch = value.match(/^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif|webp)(\?.*)?$/);

        if (customEmojiMatch) {
          const animated = customEmojiMatch[1] === 'a';
          const emojiId = customEmojiMatch[3];
          const imageUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;
          if (emojiPreviewImg) {
            emojiPreviewImg.src = imageUrl;
            emojiPreviewImg.classList.remove('hidden');
          }
        } else if (discordEmojiUrlMatch) {
          // Si c'est une URL d'emoji Discord, la nettoyer pour l'aperçu
          const emojiId = discordEmojiUrlMatch[1];
          const isAnimated = discordEmojiUrlMatch[2] === 'gif' || (discordEmojiUrlMatch[3] && discordEmojiUrlMatch[3].includes('animated=true'));
          const imageUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
          if (emojiPreviewImg) {
            emojiPreviewImg.src = imageUrl;
            emojiPreviewImg.classList.remove('hidden');
          }
        } else if (value.length > 0) {
          // Si c'est un emoji Unicode ou autre texte
          if (emojiTextPreview) {
            emojiTextPreview.textContent = value;
            emojiTextPreview.classList.remove('hidden');
          }
        }
      }

      // Écouteur d'événements pour l'input de la valeur de l'image/emoji
      if (itemImageValueInput) itemImageValueInput.addEventListener('input', (e) => {
        updateEmojiPreview(e.target.value);
      });

      // Toggle stock input based on unlimited stock checkbox
      if (document.getElementById('item-unlimited-stock')) document.getElementById('item-unlimited-stock').addEventListener('change', (e) => {
        const stockInput = document.getElementById('item-stock');
        if (stockInput) {
          if (e.target.checked) {
            stockInput.setAttribute('disabled', 'true');
            stockInput.value = ''; // Clear value when unlimited
          } else {
            stockInput.removeAttribute('disabled');
          }
        }
      });


      if (shopItemsList) shopItemsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
          const itemId = e.target.dataset.itemId;
          try {
            const response = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/shop/items/${itemId}`, {
              headers: { "Authorization": `Bearer ${accessToken}` }
            });
            if (!response.ok) {
              if (response.status === 403) {
                alert("Vous n'avez pas les permissions nécessaires pour gérer ce serveur.");
                window.location.href = "./serveur.html";
                return;
              }
              throw new Error('Failed to fetch item for editing.');
            }
            const item = await response.json();

            if (itemFormContainer) itemFormContainer.classList.remove('hidden');
            if (itemFormTitle) itemFormTitle.textContent = 'Modifier l\'article';
            if (itemIdHidden) itemIdHidden.value = item.id;
            if (document.getElementById('item-name')) document.getElementById('item-name').value = item.name;
            if (document.getElementById('item-description')) document.getElementById('item-description').value = item.description || '';

            // Remplir l'input image/emoji et mettre à jour l'aperçu
            if (itemImageValueInput) itemImageValueInput.value = item.image_url || '';
            updateEmojiPreview(item.image_url || '');

            if (document.getElementById('item-sellable')) document.getElementById('item-sellable').checked = item.sellable;
            if (document.getElementById('item-usable')) document.getElementById('item-usable').checked = item.usable;
            if (document.getElementById('item-inventory')) document.getElementById('item-inventory').checked = item.inventory;
            if (document.getElementById('item-price')) document.getElementById('item-price').value = item.price;
            if (document.getElementById('item-stock')) document.getElementById('item-stock').value = item.stock !== null ? item.stock : '';
            if (document.getElementById('item-unlimited-stock')) document.getElementById('item-unlimited-stock').checked = item.unlimited_stock;
            if (document.getElementById('item-max-purchase-per-transaction')) document.getElementById('item-max-purchase-per-transaction').value = item.max_purchase_per_transaction !== null ? item.max_purchase_per_transaction : '';
            // Trigger change event to disable/enable stock input
            if (document.getElementById('item-unlimited-stock')) document.getElementById('item-unlimited-stock').dispatchEvent(new Event('change'));


            // Populate requirements
            if (itemRequirementsContainer) itemRequirementsContainer.innerHTML = '';
            item.requirements.forEach(req => addRequirementField(itemRequirementsContainer, req.type, req.value));

            // Populate on use requirements
            if (itemOnUseRequirementsContainer) itemOnUseRequirementsContainer.innerHTML = '';
            if (item.on_use_requirements) { // Check if property exists
              item.on_use_requirements.forEach(req => addRequirementField(itemOnUseRequirementsContainer, req.type, req.value));
            }

            // Populate on purchase actions
            if (itemOnPurchaseActionsContainer) itemOnPurchaseActionsContainer.innerHTML = '';
            item.on_purchase_actions.forEach(action => addActionField(itemOnPurchaseActionsContainer, action.type, action.value));

            // Populate on use actions
            if (itemOnUseActionsContainer) itemOnUseActionsContainer.innerHTML = '';
            item.on_use_actions.forEach(action => addActionField(itemOnUseActionsContainer, action.type, action.value));

            if (shopItemStatus) shopItemStatus.classList.add('hidden');

          } catch (err) {
            console.error("Error editing item:", err);
            if (shopItemStatus) showStatus(shopItemStatus, `Erreur lors du chargement de l'article: ${err.message}`, false);
          }
        } else if (e.target.classList.contains('delete-btn')) {
          const itemId = e.target.dataset.itemId;
          if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            try {
              const response = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/shop/items/${itemId}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${accessToken}` }
              });
              if (!response.ok) {
                if (response.status === 403) {
                  alert("Vous n'avez pas les permissions nécessaires pour gérer ce serveur.");
                  window.location.href = "./serveur.html";
                  return;
                }
                throw new Error('Failed to delete item.');
              }
              if (shopItemStatus) showStatus(shopItemStatus, 'Article supprimé avec succès !', true);
              loadShopItems();
            } catch (err) {
              console.error("Error deleting item:", err);
              if (shopItemStatus) showStatus(shopItemStatus, `Erreur lors de la suppression de l'article: ${err.message}`, false);
            }
          }
        }
      });

      if (shopItemForm) shopItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (shopItemStatus) shopItemStatus.classList.add('hidden');

        const itemId = itemIdHidden?.value;
        const isEditing = !!itemId;

        const requirements = Array.from(itemRequirementsContainer?.children || []).map(div => {
          const type = div.querySelector('select[name="req-type"]')?.value;
          let value;
          if (['has_role', 'not_has_role'].includes(type)) {
            value = div.querySelector('select[name="req-value"]')?.value;
          } else if (['has_item', 'not_has_item'].includes(type)) {
            value = {
              itemId: parseInt(div.querySelector('select[name="req-item-id"]')?.value || '0'), // Ensure itemId is an integer
              quantity: parseInt(div.querySelector('input[name="req-item-quantity"]')?.value || '1')
            };
          }
          return { type, value };
        });

        const onUseRequirements = Array.from(itemOnUseRequirementsContainer?.children || []).map(div => {
          const type = div.querySelector('select[name="req-type"]')?.value;
          let value;
          if (['has_role', 'not_has_role'].includes(type)) {
            value = div.querySelector('select[name="req-value"]')?.value;
          } else if (['has_item', 'not_has_item'].includes(type)) {
            value = {
              itemId: parseInt(div.querySelector('select[name="req-item-id"]')?.value || '0'), // Ensure itemId is an integer
              quantity: parseInt(div.querySelector('input[name="req-item-quantity"]')?.value || '1')
            };
          }
          return { type, value };
        });

        const onPurchaseActions = Array.from(itemOnPurchaseActionsContainer?.children || []).map(div => {
          const type = div.querySelector('select[name="action-type"]')?.value;
          let value;
          if (['give_role', 'remove_role'].includes(type)) {
            value = div.querySelector('select[name="action-value"]')?.value;
          } else if (type === 'give_money') {
            value = parseInt(div.querySelector('input[name="action-value"]')?.value || '0');
          } else if (['give_item', 'remove_item'].includes(type)) {
            value = {
              itemId: parseInt(div.querySelector('select[name="action-item-id"]')?.value || '0'), // Ensure itemId is an integer
              quantity: parseInt(div.querySelector('input[name="action-item-quantity"]')?.value || '1')
            };
          }
          return { type, value };
        });

        const onUseActions = Array.from(itemOnUseActionsContainer?.children || []).map(div => {
          const type = div.querySelector('select[name="action-type"]')?.value;
          let value;
          if (['give_role', 'remove_role'].includes(type)) {
            value = div.querySelector('select[name="action-value"]')?.value;
          } else if (type === 'give_money') {
            value = parseInt(div.querySelector('input[name="action-value"]')?.value || '0');
          } else if (['give_item', 'remove_item'].includes(type)) {
            value = {
              itemId: parseInt(div.querySelector('select[name="action-item-id"]')?.value || '0'), // Ensure itemId is an integer
              quantity: parseInt(div.querySelector('input[name="action-item-quantity"]')?.value || '1')
            };
          }
          return { type, value };
        });

        // Traitement de la valeur de l'emoji/image_url avant l'envoi
        let processedImageUrl = itemImageValueInput?.value || '';
        const customEmojiMatch = processedImageUrl.match(/<?(a)?:?(\w+):(\d+)>?/);
        const discordEmojiUrlMatch = processedImageUrl.match(/^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif|webp)(\?.*)?$/);

        if (customEmojiMatch) {
          // Convertir <:name:id> ou <a:name:id> en URL Discord
          const animated = customEmojiMatch[1] === 'a';
          const emojiId = customEmojiMatch[3];
          processedImageUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;
        } else if (discordEmojiUrlMatch) {
          // Nettoyer l'URL d'emoji Discord pour qu'elle soit toujours .png ou .gif
          const emojiId = discordEmojiUrlMatch[1];
          const isAnimated = discordEmojiUrlMatch[2] === 'gif' || (discordEmojiUrlMatch[3] && discordEmojiUrlMatch[3].includes('animated=true'));
          processedImageUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;
        }
        // Si c'est un emoji Unicode, il reste tel quel.

        const payload = {
          name: document.getElementById('item-name')?.value || '',
          description: document.getElementById('item-description')?.value || '',
          image_url: processedImageUrl, // Utilise la valeur traitée
          sellable: document.getElementById('item-sellable')?.checked || false,
          usable: document.getElementById('item-usable')?.checked || false,
          inventory: document.getElementById('item-inventory')?.checked || false,
          price: parseInt(document.getElementById('item-price')?.value || '0'),
          stock: document.getElementById('item-unlimited-stock')?.checked ? null : parseInt(document.getElementById('item-stock')?.value || '0'),
          unlimited_stock: document.getElementById('item-unlimited-stock')?.checked || false,
          max_purchase_per_transaction: document.getElementById('item-max-purchase-per-transaction')?.value === '' ? null : parseInt(document.getElementById('item-max-purchase-per-transaction')?.value || '0'),
          requirements: requirements,
          on_use_requirements: onUseRequirements,
          on_purchase_actions: onPurchaseActions,
          on_use_actions: onUseActions
        };

        try {
          const method = isEditing ? 'PUT' : 'POST';
          const url = isEditing ? `${backendUrl}/api/guilds/${guildId}/shop/items/${itemId}` : `${backendUrl}/api/guilds/${guildId}/shop/items`;

          const response = await makeApiRequest(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} item.`);
          }

          if (shopItemStatus) showStatus(shopItemStatus, `Article ${isEditing ? 'mis à jour' : 'ajouté'} avec succès !`, true);
          if (shopItemForm) shopItemForm.reset();
          if (itemFormContainer) itemFormContainer.classList.add('hidden');
          loadShopItems();

        } catch (err) {
          console.error(`Error ${isEditing ? 'updating' : 'adding'} item:`, err);
          if (shopItemStatus) showStatus(shopItemStatus, `Erreur: ${err.message}`, false);
        }
      });

      // Dynamic Requirement Fields (updated to accept container)
      function addRequirementField(container, type = '', value = '') {
        if (!container) return;
        const div = document.createElement('div');
        div.classList.add('dynamic-input-group', 'flex', 'items-center', 'gap-2');
        div.innerHTML = `
              <select name="req-type" class="w-1/3 p-2 rounded bg-gray-600 border border-gray-500 text-white custom-select">
                  <option value="has_role">Avoir le rôle</option>
                  <option value="not_has_role">Ne pas avoir le rôle</option>
                  <option value="has_item">Avoir cet item</option>
                  <option value="not_has_item">Ne pas avoir cet item</option>
              </select>
              <div class="flex-grow req-value-wrapper"></div>
              <button type="button" class="remove-btn">X</button>
          `;
        const reqTypeSelect = div.querySelector('select[name="req-type"]');
        const reqValueWrapper = div.querySelector('.req-value-wrapper');

        function updateReqValueInput(selectedType, selectedValue = '') {
          if (!reqValueWrapper) return;
          reqValueWrapper.innerHTML = ''; // Clear previous input
          if (['has_role', 'not_has_role'].includes(selectedType)) {
            const roleSelect = createRoleSelectElement(selectedValue);
            roleSelect.setAttribute('name', 'req-value');
            reqValueWrapper.appendChild(roleSelect);
          } else if (['has_item', 'not_has_item'].includes(selectedType)) {
            const itemSelect = createItemSelectElement(selectedValue.itemId); // Pass itemId
            itemSelect.setAttribute('name', 'req-item-id');
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.name = 'req-item-quantity';
            quantityInput.value = selectedValue.quantity || 1;
            quantityInput.min = 1;
            quantityInput.classList.add('w-1/3', 'p-2', 'rounded', 'bg-gray-600', 'border', 'border-gray-500', 'text-white');
            
            const itemGroup = document.createElement('div');
            itemGroup.classList.add('flex', 'gap-2', 'w-full');
            itemGroup.appendChild(itemSelect);
            itemGroup.appendChild(quantityInput);
            reqValueWrapper.appendChild(itemGroup);
          }
        }

        if (reqTypeSelect) reqTypeSelect.addEventListener('change', (e) => {
          // If value is an object (for items), pass the object, otherwise pass the string
          const initialValue = (e.target.value === 'has_item' || e.target.value === 'not_has_item') ? value : value;
          updateReqValueInput(e.target.value, initialValue);
        });
        
        // Set initial selected type and value
        if (reqTypeSelect) reqTypeSelect.value = type;
        // Pass the correct value format based on type
        const initialValue = (type === 'has_item' || type === 'not_has_item') ? value : value;
        updateReqValueInput(type, initialValue);

        div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
        container.appendChild(div);
      }

      function addActionField(container, type = '', value = '') {
        if (!container) return;
        const div = document.createElement('div');
        div.classList.add('dynamic-input-group', 'flex', 'items-center', 'gap-2');
        div.innerHTML = `
              <select name="action-type" class="w-1/3 p-2 rounded bg-gray-600 border border-gray-500 text-white custom-select">
                  <option value="give_role">Donner un rôle</option>
                  <option value="remove_role">Retirer un rôle</option>
                  <option value="give_money">Donner de l'argent</option>
                  <option value="give_item">Donner un item</option>
                  <option value="remove_item">Retirer un item</option>
              </select>
              <div class="flex-grow action-value-wrapper"></div>
              <button type="button" class="remove-btn">X</button>
          `;
        const actionTypeSelect = div.querySelector('select[name="action-type"]');
        const actionValueWrapper = div.querySelector('.action-value-wrapper');

        function updateActionValueInput(selectedType, selectedValue = '') {
          if (!actionValueWrapper) return;
          actionValueWrapper.innerHTML = ''; // Clear previous input
          if (['give_role', 'remove_role'].includes(selectedType)) {
            const roleSelect = createRoleSelectElement(selectedValue);
            roleSelect.setAttribute('name', 'action-value');
            actionValueWrapper.appendChild(roleSelect);
          } else if (selectedType === 'give_money') {
            const input = document.createElement('input');
            input.type = 'number';
            input.name = 'action-value';
            input.value = selectedValue || 0;
            input.min = 0;
            input.classList.add('w-full', 'p-2', 'rounded', 'bg-gray-600', 'border', 'border-gray-500', 'text-white');
            actionValueWrapper.appendChild(input);
          } else if (['give_item', 'remove_item'].includes(selectedType)) {
            const itemSelect = createItemSelectElement(selectedValue.itemId); // Pass itemId
            itemSelect.setAttribute('name', 'action-item-id');
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.name = 'action-item-quantity';
            quantityInput.value = selectedValue.quantity || 1;
            quantityInput.min = 1;
            quantityInput.classList.add('w-1/3', 'p-2', 'rounded', 'bg-gray-600', 'border', 'border-gray-500', 'text-white');
            
            const itemGroup = document.createElement('div');
            itemGroup.classList.add('flex', 'gap-2', 'w-full');
            itemGroup.appendChild(itemSelect);
            itemGroup.appendChild(quantityInput);
            actionValueWrapper.appendChild(itemGroup);
          }
        }

        if (actionTypeSelect) actionTypeSelect.addEventListener('change', (e) => {
          const initialValue = (e.target.value === 'give_item' || e.target.value === 'remove_item') ? value : value;
          updateActionValueInput(e.target.value, initialValue);
        });
        
        // Set initial selected type and value
        if (actionTypeSelect) actionTypeSelect.value = type;
        const initialValue = (type === 'give_item' || type === 'remove_item') ? value : value;
        updateActionValueInput(type, initialValue);

        div.querySelector('.remove-btn').addEventListener('click', () => div.remove());
        container.appendChild(div);
      }

      if (addRequirementBtn) addRequirementBtn.addEventListener('click', () => addRequirementField(itemRequirementsContainer));
      if (addOnUseRequirementBtn) addOnUseRequirementBtn.addEventListener('click', () => addRequirementField(itemOnUseRequirementsContainer));
      if (addOnPurchaseActionBtn) addOnPurchaseActionBtn.addEventListener('click', () => addActionField(itemOnPurchaseActionsContainer));
      if (addOnUseActionBtn) addOnUseActionBtn.addEventListener('click', () => addActionField(itemOnUseActionsContainer));

      // --- Game Forms Submission ---
      if (crashGameForm) crashGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (crashGameStatus) crashGameStatus.classList.add('hidden');
        const payload = {
          crash_game: {
            embed_color: document.getElementById('crash-embed-color')?.value || '#FF0000',
            min_bet: parseInt(document.getElementById('crash-min-bet')?.value || '1'),
            max_bet: parseInt(document.getElementById('crash-max-bet')?.value || '1000'),
            min_multiplier: parseFloat(document.getElementById('crash-min-multiplier')?.value || '1.01'),
            max_multiplier: parseFloat(document.getElementById('crash-max-multiplier')?.value || '100'),
            crash_chance: parseInt(document.getElementById('crash-crash-chance')?.value || '50')
          }
        };
        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
            body: JSON.stringify(payload)
          });
          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Failed to save Crash Game settings.");
          }
          if (crashGameStatus) showStatus(crashGameStatus, "Crash Game settings saved successfully!", true);
          settingsCache.games = null; // Invalider le cache
          await loadGameSettings();
        } catch (err) {
          console.error("Error saving Crash Game settings:", err);
          if (crashGameStatus) showStatus(crashGameStatus, `Error: ${err.message}`, false);
        }
      });

      if (plinkoGameForm) plinkoGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (plinkoGameStatus) plinkoGameStatus.classList.add('hidden');
        const multipliers = getPlinkoMultipliers(); // Récupérer les multiplicateurs des champs dynamiques
        const rows = parseInt(document.getElementById('plinko-rows')?.value || '8');

        if (multipliers.length === 0) {
          if (plinkoGameStatus) showStatus(plinkoGameStatus, "Veuillez ajouter au moins un multiplicateur pour Plinko.", false);
          return;
        }
        if (multipliers.length !== (rows + 1)) {
          if (plinkoGameStatus) showStatus(plinkoGameStatus, `Le nombre de multiplicateurs (${multipliers.length}) doit être égal au nombre de lignes (${rows}) + 1.`, false);
          return;
        }

        const payload = {
          plinko_game: {
            embed_color: document.getElementById('plinko-embed-color')?.value || '#00FF00',
            min_bet: parseInt(document.getElementById('plinko-min-bet')?.value || '1'),
            max_bet: parseInt(document.getElementById('plinko-max-bet')?.value || '500'),
            rows: rows,
            multipliers: multipliers // Utiliser le tableau de multiplicateurs
          }
        };
        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
            body: JSON.stringify(payload)
          });
          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Failed to save Plinko settings.");
          }
          if (plinkoGameStatus) showStatus(plinkoGameStatus, "Plinko settings saved successfully!", true);
          settingsCache.games = null; // Invalider le cache
          await loadGameSettings();
        } catch (err) {
          console.error("Error saving Plinko settings:", err);
          if (plinkoGameStatus) showStatus(plinkoGameStatus, `Error: ${err.message}`, false);
        }
      });

      if (rouletteGameForm) rouletteGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (rouletteGameStatus) rouletteGameStatus.classList.add('hidden');
        const outcomes = getRouletteOutcomes(); // Récupérer les résultats des champs dynamiques

        if (outcomes.length === 0) {
          if (rouletteGameStatus) showStatus(rouletteGameStatus, "Veuillez ajouter au moins un résultat pour la Roulette.", false);
          return;
        }

        // Validation des numéros dupliqués pour des paris de même nom
        const outcomeNames = {};
        for (const outcome of outcomes) {
          if (!outcomeNames[outcome.name]) {
            outcomeNames[outcome.name] = new Set();
          }
          for (const num of outcome.numbers) {
            if (outcomeNames[outcome.name].has(num)) {
              if (rouletteGameStatus) showStatus(rouletteGameStatus, `Erreur: Le numéro ${num} est dupliqué pour le pari "${outcome.name}". Chaque numéro doit être unique par nom de pari.`, false);
              return;
            }
            outcomeNames[outcome.name].add(num);
          }
        }


        const payload = {
          roulette_game: {
            embed_color: document.getElementById('roulette-embed-color')?.value || '#0000FF',
            min_bet: parseInt(document.getElementById('roulette-min-bet')?.value || '1'),
            max_bet: parseInt(document.getElementById('roulette-max-bet')?.value || '2000'),
            outcomes: outcomes // Utiliser le tableau de résultats
          }
        };
        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
            body: JSON.stringify(payload)
          });
          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Failed to save Roulette settings.");
          }
          if (rouletteGameStatus) showStatus(rouletteGameStatus, "Roulette settings saved successfully!", true);
          settingsCache.games = null; // Invalider le cache
          await loadGameSettings();
        } catch (err) {
          console.error("Error saving Roulette settings:", err);
          if (rouletteGameStatus) showStatus(rouletteGameStatus, `Error: ${err.message}`, false);
        }
      });

      if (diceGameForm) diceGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (diceGameStatus) diceGameStatus.classList.add('hidden');
        const payload = {
          dice_game: {
            embed_color: document.getElementById('dice-embed-color')?.value || '#FFFF00',
            min_bet: parseInt(document.getElementById('dice-min-bet')?.value || '1'),
            max_bet: parseInt(document.getElementById('dice-max-bet')?.value || '100'),
            min_roll: parseInt(document.getElementById('dice-min-roll')?.value || '1'),
            max_roll: parseInt(document.getElementById('dice-max-roll')?.value || '99')
          }
        };
        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
            body: JSON.stringify(payload)
          });
          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Failed to save Dice Roll settings.");
          }
          if (diceGameStatus) showStatus(diceGameStatus, "Dice Roll settings saved successfully!", true);
          settingsCache.games = null; // Invalider le cache
          await loadGameSettings();
        } catch (err) {
          console.error("Error saving Dice Roll settings:", err);
          if (diceGameStatus) showStatus(diceGameStatus, `Error: ${err.message}`, false);
        }
      });

      // NOUVEAU: Soumission du formulaire de permissions
      if (permissionsForm) permissionsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (permissionsStatus) permissionsStatus.classList.add('hidden');

        const adminRoles = Array.from(adminRolesContainer?.querySelectorAll('select[name="admin-role-id"]') || [])
          .map(select => select.value)
          .filter(value => value); // Filtrer les valeurs vides

        const commandStates = {};
        commandTogglesContainer?.querySelectorAll('.command-toggle-group').forEach(div => {
          const commandName = div.dataset.commandName;
          const enabled = div.querySelector('.command-enabled-checkbox')?.checked || false;
          const slash = div.querySelector('.command-slash-checkbox')?.checked || false;
          const prefix = div.querySelector('.command-prefix-checkbox')?.checked || false;
          commandStates[commandName] = { enabled, slash, prefix };
        });

        const payload = {
          permissions: {
            admin_roles: adminRoles,
            command_states: commandStates
          }
        };

        try {
          const saveResponse = await makeApiRequest(`${backendUrl}/api/guilds/${guildId}/settings/economy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(errorData.message || "Échec de la sauvegarde des permissions.");
          }

          if (permissionsStatus) showStatus(permissionsStatus, "Permissions sauvegardées avec succès !", true);
          settingsCache.permissions = null; // Invalider le cache
          await loadPermissionsSettings();

        } catch (err) {
          console.error("Error saving permissions settings:", err);
          if (permissionsStatus) showStatus(permissionsStatus, `Erreur: ${err.message}`, false);
        }
      });

    });
  </script>
</body>

</html>
