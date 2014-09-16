TH.Templates.app = "    <div class='frame'>        <div class='mainview view'>            <div class='day_view with_controls selected calendar'>            </div>            <!-- <div id='calendar' style='opacity: 1; -webkit-margin-start:0px'></div> -->        </div>        <div class='navigation'>            </div>    </div>";

TH.Templates.calendar = "<!-- <header> -->  <div>  <h1 class='title'>    {{{title}}}    <!-- <span class='sub_title'>{{formalDate}}</span> -->  </h1>  </div><!-- </header> --><div class='calendar_panel'></div>";

TH.Templates.day = "<header>  <h1 class='title'>    {{{title}}}    <span class='sub_title'>{{formalDate}}</span>  </h1>  <div class='corner'>    <input class='search' placeholder='{{i18n_search_input_placeholder_text}}' tabindex='1' type='text' />  </div>  <div class='controls'>    <a class='text back_to_week' href='{{weekUrl}}'>      {{{i18n_back_to_week_link}}}    </a>    <div class='spacer'></div>    <button class='delete_day' disabled='disabled'>      {{i18n_delete_all_visits_for_filter_button}}    </button>  </div></header><div class='content'></div>";

TH.Templates.day_results = "<ol class='history'>    {{#history}}    <li class='interval highlightable' data-id='{{id}}' draggable='true'>    <!-- <li class='interval highlightable' draggable='true' id='{{interval_id}}'> -->    <header>        <!-- <div> -->        <!-- <h4 class='title'>{{time}}</h4> -->        <div class='drag_handle'>            <div class='line'></div>            <div class='line'></div>            <div class='line'></div>            <div class='line'></div>            <div class='line'></div>        </div>        <a class='title' title='Drag to tag this interval' style='font-size:150%;'>{{time}}</a>        <a class='delete_interval delete' href='#' title='{{i18n_prompt_delete_button}}'>            {{i18n_prompt_delete_button}}        </a>    </header>    <ol class='visits highlightable editable'>        {{#visits}}        <li class='visit' draggable='true' data-id='{{id}}'>        <div class='drag_handle'>            <div class='line'></div>            <div class='line'></div>            <div class='line'></div>            <div class='line'></div>            <div class='line'></div>        </div>        <div class='visit_item'>        <a href='{{url}}' class='site'>            <dl class='description' style='background-image: url(chrome://favicon/{{url}})'>                <dt>                <div class='active_tags'></div>                    <div class='active_tags_view'>                        <ul class='tags'>                                  {{#tag}}                            <li>{{tag_name}}</li>                            {{/tag}}                        </ul>                    </div>                <!-- {{{title}}} -->                {{#title}}                    {{{title}}}                {{/title}}                {{^title}}                No Title                {{/title}}                </dt>                <dd class='time'>{{time}}</dd>                <dd class='location'>{{host}}{{path}}</dd>            </dl>        </a>        </div>        <a class='search_domain action' href='#search/{{host}}'>{{i18n_search_by_domain}}</a>        <a class='delete_visit delete' href='#' title='{{i18n_prompt_delete_button}}'>{{i18n_prompt_delete_button}}</a>        </li>        {{/visits}}    </ol>    </li>    {{/history}}</ol>{{^history}}<p>{{i18n_no_visits_found}}</p>{{/history}}";

TH.Templates.evernote = "<ul>          {{#.}}    <li>          <div>{{tag_name}}</div>    <ul>        {{#items}}        <li>         <div>            <a href='{{url}}'>                <dl style='background-image: url(chrome://favicon/{{url}})'>                    {{#title}}                    {{{title}}}                    {{/title}}                    {{^title}}                    No Title                    {{/title}}                    <dt>{{tstr}}</dt>                </dl>            </a>        </div>        </li>        {{/items}}    </ul>    </li>         {{/.}}</ul>";

TH.Templates.menu = "            <h1>      <a href='#/'>        Tag History </a>    </h1>                <div class='available_tags'></div>                <ul class='menu'>                      <div id='menu_title'>Tags</div>                <!-- <li class=''>        <a class='tags' href='#tags'>          Tags          </a>      </li>     -->            </ul>                <div class='menu menu_view disappearable' id='tags_menu'>                <!-- <ul class='menu'>       -->                <!--     <li>       -->                <!--     <div id='tag1' class='tags'>Research</div> -->                <!--     <div id='tag2' class='tags'>Music</div> -->                <!--     </li>       -->                <!-- </ul> -->            </div>            <div class='menu menu_view disappearable' id='tags_menu1'>                <!-- <ul><li>Plus</li></ul> -->                <!-- <div class='tags'>+</div> -->                <!-- </div> -->                <p class='speech'>Tagged !</p>                <ul class='menu disappearable'><li class=''>        <a                        class='setting' href='#settings'>          Settings        </a>                    <div>                    <div>Interval</div>                     <div id='interval_slider'></div>                    <div id='interval_value'></div>                    </div>                </li></ul>              </div>            <div class='menu disappearable' id='trash_bin' align='middle'>                <img src='images/trash.ico' alt='trash', height='80' width='80' align='middle'>            </div>            <!-- <div id='coverup'></div> -->";

TH.Templates.tags = "<ul class='menu'>          <li>          {{#tagList}}    <div class='tags' draggable='true'>{{tag_name}}</div>    {{/tagList}}    <div class='tags' id='create_new_tag'>+</div>    <div class='top_bar'>        <button id='view_network'>View Tag Graph</button>     <div>    </li>     </ul>";

