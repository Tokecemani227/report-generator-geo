/**
 * Report Builder UI — renders and wires the interactive builder into the
 * Add-In container element.
 *
 * Layout (matches the UI mockup v0.2):
 *   - Report Parameters (Vehicle Group, Report Date)
 *   - Report Modules (selectable KPI cards from the registry)
 *   - Data Summary (KPI metric cards)
 *   - Report Preview (printable report paper)
 */
FRG.define('uiBuilder', function (FRG) {
    'use strict';

    function createElement(tag, className, text) {
        var el = document.createElement(tag);
        if (className) {
            el.className = className;
        }
        if (text !== undefined && text !== null) {
            el.textContent = text;
        }
        return el;
    }

    function create(container, deps) {
        var client = deps.client;
        var registry = deps.registry;
        var controller = deps.controller;
        var renderer = deps.renderer;
        var state = deps.state;

        var groups = [];
        var selectedGroupId = null;
        var reportDate = FRG.dateTime.nowIso().slice(0, 10);
        var selectedModuleIds = [];

        var els = {};

        function selectedGroupLabel() {
            if (!selectedGroupId) {
                return 'All Groups';
            }
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].id === selectedGroupId) {
                    return groups[i].name;
                }
            }
            return 'Selected Group';
        }

        function buildScope() {
            return {
                groupIds: selectedGroupId ? [selectedGroupId] : [],
                groupNames: selectedGroupId ? [selectedGroupLabel()] : [],
                reportDate: reportDate,
                label: selectedGroupLabel()
            };
        }

        function buildHead() {
            var head = createElement('div', 'page-head');

            var titleWrap = createElement('div');
            titleWrap.appendChild(createElement('h1', 'page-title', 'Report Builder'));
            titleWrap.appendChild(createElement('p', 'page-desc',
                'Build a fleet report by selecting the required vehicle group and KPI modules.'));

            var actions = createElement('div', 'actions');
            els.resetButton = createElement('button', 'btn', 'Reset');
            els.generateButton = createElement('button', 'btn btn-primary', 'Generate Report');

            els.resetButton.addEventListener('click', resetReport);
            els.generateButton.addEventListener('click', generateReport);

            actions.appendChild(els.resetButton);
            actions.appendChild(els.generateButton);

            head.appendChild(titleWrap);
            head.appendChild(actions);
            return head;
        }

        function buildParameters() {
            var section = createElement('section', 'section');

            var head = createElement('div', 'section-head');
            head.appendChild(createElement('h2', 'section-title', 'Report Parameters'));
            head.appendChild(createElement('span', 'section-note', 'Define the scope of this report'));

            var body = createElement('div', 'section-body');
            var grid = createElement('div', 'grid-4');
            grid.style.gridTemplateColumns = 'repeat(2, minmax(220px, 1fr))';
            grid.style.maxWidth = '650px';

            var groupField = createElement('div', 'field');
            groupField.appendChild(createElement('label', null, 'Vehicle Group'));
            els.groupSelect = createElement('select', 'select');
            els.groupSelect.addEventListener('change', function () {
                selectedGroupId = els.groupSelect.value || null;
            });
            groupField.appendChild(els.groupSelect);

            var dateField = createElement('div', 'field');
            dateField.appendChild(createElement('label', null, 'Report Date'));
            els.dateInput = createElement('input', 'input');
            els.dateInput.type = 'date';
            els.dateInput.value = reportDate;
            els.dateInput.addEventListener('change', function () {
                reportDate = els.dateInput.value || reportDate;
            });
            dateField.appendChild(els.dateInput);

            grid.appendChild(groupField);
            grid.appendChild(dateField);
            body.appendChild(grid);

            section.appendChild(head);
            section.appendChild(body);
            return section;
        }

        function buildModules() {
            var section = createElement('section', 'section');

            var head = createElement('div', 'section-head');
            var headLeft = createElement('div');
            headLeft.appendChild(createElement('h2', 'section-title', 'Report Modules'));
            headLeft.appendChild(createElement('span', 'section-note',
                'Select only the KPIs required for this report'));
            head.appendChild(headLeft);
            els.moduleCount = createElement('span', 'section-note', '0 modules selected');
            head.appendChild(els.moduleCount);

            var body = createElement('div', 'section-body');
            els.moduleGrid = createElement('div', 'module-grid');

            var modules = registry.selectable();
            modules.forEach(function (module) {
                var card = createElement('div', 'module');
                card.dataset.moduleId = module.id;

                card.appendChild(createElement('div', 'check', '\u2713'));
                card.appendChild(createElement('div', 'module-icon', '\u25C9'));
                card.appendChild(createElement('div', 'module-title', module.name));
                card.appendChild(createElement('div', 'module-desc', module.description));
                card.appendChild(createElement('span', 'module-tag', module.available === false ? 'PLANNED' : 'AVAILABLE'));

                card.addEventListener('click', function () {
                    toggleModule(card, module.id);
                });

                els.moduleGrid.appendChild(card);
            });

            body.appendChild(els.moduleGrid);
            section.appendChild(head);
            section.appendChild(body);

            return section;
        }

        function buildSummary() {
            var section = createElement('section', 'section');

            var head = createElement('div', 'section-head');
            head.appendChild(createElement('h2', 'section-title', 'Data Summary'));
            head.appendChild(createElement('span', 'section-note', 'Preview from selected module'));
            section.appendChild(head);

            var body = createElement('div', 'section-body');
            els.summaryGrid = createElement('div', 'summary-grid');
            els.summaryGrid.innerHTML = summaryPlaceholder();
            body.appendChild(els.summaryGrid);
            section.appendChild(body);

            return section;
        }

        function summaryPlaceholder() {
            return '<div class="metric">' +
                '<div class="metric-label">Total Devices</div>' +
                '<div class="metric-value">--</div>' +
                '<div class="metric-meta">Run a report to populate</div>' +
                '</div>' +
                '<div class="metric">' +
                '<div class="metric-label">Online</div>' +
                '<div class="metric-value">--</div>' +
                '<div class="metric-meta">Run a report to populate</div>' +
                '</div>' +
                '<div class="metric">' +
                '<div class="metric-label">Offline</div>' +
                '<div class="metric-value">--</div>' +
                '<div class="metric-meta">Run a report to populate</div>' +
                '</div>' +
                '<div class="metric">' +
                '<div class="metric-label">Status Unknown</div>' +
                '<div class="metric-value">--</div>' +
                '<div class="metric-meta">Devices with no status record</div>' +
                '</div>';
        }

        function buildPreview() {
            var section = createElement('section', 'section');

            var head = createElement('div', 'section-head');
            head.appendChild(createElement('h2', 'section-title', 'Report Preview'));
            head.appendChild(createElement('span', 'section-note', 'What will appear in the final report'));
            section.appendChild(head);

            var body = createElement('div', 'section-body');

            var toolbar = createElement('div', 'preview-toolbar');
            toolbar.appendChild(createElement('div', 'preview-title', 'Fleet Monitoring Report'));

            var actions = createElement('div', 'preview-actions');
            var printButton = createElement('button', 'btn', 'Print / Save PDF');
            var refreshButton = createElement('button', 'btn btn-primary', 'Refresh Preview');

            printButton.addEventListener('click', function () {
                if (typeof window !== 'undefined' && window.print) {
                    window.print();
                }
            });
            refreshButton.addEventListener('click', generateReport);

            actions.appendChild(printButton);
            actions.appendChild(refreshButton);
            toolbar.appendChild(actions);

            els.previewSlot = createElement('div', null);
            els.previewSlot.innerHTML = previewPlaceholder();

            body.appendChild(toolbar);
            body.appendChild(els.previewSlot);
            section.appendChild(body);

            return section;
        }

        function previewPlaceholder() {
            return '<div class="report-paper"><p class="empty-note">Generate a report to preview it here.</p></div>';
        }

        function toggleModule(card, moduleId) {
            var index = selectedModuleIds.indexOf(moduleId);
            if (index >= 0) {
                selectedModuleIds.splice(index, 1);
                card.classList.remove('selected');
            } else {
                selectedModuleIds.push(moduleId);
                card.classList.add('selected');
            }
            updateModuleCount();
        }

        function updateModuleCount() {
            els.moduleCount.textContent = selectedModuleIds.length +
                (selectedModuleIds.length === 1 ? ' module selected' : ' modules selected');
        }

        function setLoading(isLoading) {
            els.generateButton.disabled = isLoading;
            els.generateButton.textContent = isLoading ? 'Generating...' : 'Generate Report';
            els.previewSlot.innerHTML = isLoading
                ? '<div class="report-paper"><p class="empty-note">Loading fleet data...</p></div>'
                : els.previewSlot.innerHTML;
        }

        function generateReport() {
            if (selectedModuleIds.length === 0) {
                els.previewSlot.innerHTML =
                    '<div class="report-paper"><p class="empty-note">Select at least one report module.</p></div>';
                return;
            }

            setLoading(true);

            controller.generate(buildScope(), selectedModuleIds).then(function (report) {
                els.summaryGrid.innerHTML = summaryFor(report);
                els.previewSlot.innerHTML = renderer.renderPaper(report);
            }).catch(function (error) {
                els.previewSlot.innerHTML =
                    '<div class="report-paper"><p class="empty-note">' +
                    FRG.errorHandler.userMessage(error) + '</p></div>';
            }).then(function () {
                setLoading(false);
            });
        }

        function summaryFor(report) {
            var html = '';
            report.sections.forEach(function (section) {
                if (section.status === 'ok') {
                    var module = registry.get(section.moduleId);
                    if (module && typeof module.renderSummaryCards === 'function') {
                        html += module.renderSummaryCards(section.data);
                    }
                }
            });
            if (!html) {
                html = '<div class="metric"><div class="metric-label">Data Summary</div>' +
                    '<div class="metric-value">--</div>' +
                    '<div class="metric-meta">No module data available</div></div>';
            }
            return html;
        }

        function resetReport() {
            selectedModuleIds = [];
            document.querySelectorAll('#fleetReportGenerator .module.selected').forEach(function (card) {
                card.classList.remove('selected');
            });
            updateModuleCount();
            els.summaryGrid.innerHTML = summaryPlaceholder();
            els.previewSlot.innerHTML = previewPlaceholder();
        }

        function populateGroups(groupList) {
            groups = groupList || [];

            var all = createElement('option', null, 'All Groups');
            all.value = '';
            els.groupSelect.appendChild(all);

            groups.slice().sort(function (a, b) {
                return a.name.localeCompare(b.name);
            }).forEach(function (group) {
                var option = createElement('option', null, group.name);
                option.value = group.id;
                els.groupSelect.appendChild(option);
            });

            // Default to the active MyGeotab organization filter when present.
            var activeFilter = [];
            if (state && typeof state.getGroupFilter === 'function') {
                activeFilter = state.getGroupFilter() || [];
            }
            if (activeFilter.length > 0) {
                els.groupSelect.value = activeFilter[0];
                selectedGroupId = activeFilter[0];
            }
        }

        function loadGroups() {
            client.call('Get', {
                typeName: 'Group',
                propertySelector: { fields: ['id', 'name'], isIncluded: true },
                resultsLimit: 50000
            }).then(function (result) {
                populateGroups(result || []);
            }).catch(function (error) {
                els.previewSlot.innerHTML =
                    '<div class="report-paper"><p class="empty-note">' +
                    FRG.errorHandler.userMessage(error) + '</p></div>';
            });
        }

        function render() {
            container.appendChild(buildHead());
            container.appendChild(buildParameters());
            container.appendChild(buildModules());
            container.appendChild(buildSummary());
            container.appendChild(buildPreview());

            loadGroups();

            // Select the first available module by default.
            var first = registry.selectable()[0];
            if (first) {
                selectedModuleIds.push(first.id);
                els.moduleGrid.querySelector('.module').classList.add('selected');
                updateModuleCount();
            }
        }

        return {
            render: render,
            generateReport: generateReport,
            resetReport: resetReport
        };
    }

    return {
        create: create
    };
});
