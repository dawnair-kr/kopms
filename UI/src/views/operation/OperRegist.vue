<template>
  <v-container class="main-page-wrapper">
    <v-card class="pa-2 overflow-y-auto">

      <!-- ══════════════ 기본 정보 ══════════════ -->
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>기본 정보</span>
          </div>
        </div>

        <!-- 사업명: 제목형 input -->
        <div class="biz-title-wrap mb-3">
          <span class="field-label required">사업명</span>
          <v-text-field
            v-model="form.bizTitle"
            placeholder="사업명을 입력하세요"
            variant="underlined"
            density="compact"
            hide-details
            class="biz-title-input"
          />
        </div>

        <v-row no-gutters>

          <!-- 좌측: 필드 영역 -->
          <v-col cols="9">
            <!-- 사업내용 -->
            <div class="field-item mb-3">
              <span class="field-label">사업내용</span>
              <v-textarea
                v-model="form.bizContent"
                density="compact"
                hide-details
                no-resize
                variant="outlined"
                rows="3"
              />
            </div>

            <!-- 국가분류 + 위치 -->
            <v-row no-gutters class="ga-6 mb-6">
              <!-- 국가분류 -->
              <v-col>
                <div class="field-item">
                  <span class="field-label required">국가분류</span>
                  <div class="d-flex align-center ga-4">
                    <v-btn-toggle
                      v-model="countrySection"
                      mandatory
                      density="compact"
                      class="toggle-group"
                      @update:model-value="onBizSectionChange"
                    >
                      <v-btn
                        v-for="item in countrySectionItem"
                        :key="item.value"
                        :value="item.value"
                        variant="text"
                        class="toggle-btn"
                      >{{ item.label }}</v-btn>
                    </v-btn-toggle>
                    <v-autocomplete
                      v-model="form.nationCode"
                      :items="allNations"
                      item-title="codeName"
                      item-value="codeValue"
                      density="compact"
                      variant="outlined"
                      hide-details
                      placeholder="대상국가"
                      autocomplete="off"
                      :disabled="!isOverseas"
                      @update:model-value="onNationChange"
                    />
                  </div>
                </div>
              </v-col>

              <!-- 위치 -->
              <v-col>
                <div class="field-item">
                  <span class="field-label">위치</span>
                  <v-text-field v-model="form.location" variant="outlined" density="compact" hide-details />
                </div>
              </v-col>
            </v-row>

            <!-- 출자법인명 + 설비용량 -->
            <v-row no-gutters class="ga-6 mb-6">
              <v-col>
                <div class="field-item">
                  <span class="field-label">출자법인명</span>
                  <v-autocomplete
                    v-model="form.eisCompanyCode"
                    :items="eisCompanyItems"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    no-data-text="데이터 준비 중"
                  />
                </div>
              </v-col>

              <!-- 설비용량 -->
              <v-col>
                <div class="field-item">
                  <span class="field-label">설비용량</span>
                  <v-text-field v-model="form.capacity" variant="outlined" density="compact" hide-details />
                </div>
              </v-col>
            </v-row>

            <!-- 공사기간 + 사업기간 + 준공일자 + 설립일자 -->
            <v-row no-gutters class="ga-6">
              <!-- 공사기간 -->
              <v-col>
                <div class="field-item">
                  <span class="field-label">공사기간</span>
                  <div class="d-flex align-center ga-1">
                    <v-text-field
                      v-model="form.construtionPeriodFrom"
                      variant="outlined"
                      density="compact"
                      hide-details
                      maxlength="7"
                      @input="onPeriodInput('construtionPeriodFrom', $event, construtionPeriodToRef)"
                    />
                    <span class="form-unit">~</span>
                    <v-text-field
                      ref="construtionPeriodToRef"
                      v-model="form.construtionPeriodTo"
                      variant="outlined"
                      density="compact"
                      hide-details
                      maxlength="7"
                      @input="onPeriodInput('construtionPeriodTo', $event, null)"
                    />
                  </div>
                </div>
              </v-col>

              <!-- 사업기간 -->
              <v-col>
                <div class="field-item">
                  <span class="field-label">사업기간</span>
                  <div class="d-flex align-center ga-1">
                    <v-text-field
                      v-model="form.businessPeriodFrom"
                      variant="outlined"
                      density="compact"
                      hide-details
                      maxlength="8"
                      @input="onPeriodInput('businessPeriodFrom', $event, businessPeriodToRef, fmtYYMMDD)"
                    />
                    <span class="form-unit">~</span>
                    <v-text-field
                      ref="businessPeriodToRef"
                      v-model="form.businessPeriodTo"
                      variant="outlined"
                      density="compact"
                      hide-details
                      maxlength="8"
                      @input="onPeriodInput('businessPeriodTo', $event, null, fmtYYMMDD)"
                    />
                  </div>
                </div>
              </v-col>

              <!-- 준공일자 -->
              <v-col>
                <div class="field-item">
                  <span class="field-label">준공일자</span>
                  <v-menu v-model="completionDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: menuProps }">
                      <BrDateField
                        v-bind="menuProps"
                        v-model="form.completionDate"
                        variant="outlined"
                        density="compact"
                        hide-details
                        append-inner-icon="mdi-calendar"
                      />
                    </template>
                    <v-date-picker v-model="completionDatePicker" @update:model-value="onCompletionDateSelected" hide-header />
                  </v-menu>
                </div>
              </v-col>

              <!-- 설립일자 -->
              <v-col>
                <div class="field-item">
                  <span class="field-label">설립일자</span>
                  <v-menu v-model="foundationDateMenu" :close-on-content-click="false">
                    <template #activator="{ props: menuProps }">
                      <BrDateField
                        v-bind="menuProps"
                        v-model="form.foundationDate"
                        variant="outlined"
                        density="compact"
                        hide-details
                        append-inner-icon="mdi-calendar"
                      />
                    </template>
                    <v-date-picker v-model="foundationDatePicker" @update:model-value="onFoundationDateSelected" hide-header />
                  </v-menu>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <!-- 우측: 이미지 업로드 -->
          <v-col cols="3" class="d-flex flex-column pl-3">
            <span class="field-label mb-1">사진</span>
            <div
              class="photo-upload-zone flex-grow-1"
              :class="{ 'photo-upload-zone--dragover': isDragOver }"
              @click="triggerFileInput"
              @dragover.prevent="isDragOver = true"
              @dragleave="isDragOver = false"
              @drop.prevent="onDrop"
            >
              <input ref="fileInputRef" type="file" accept="image/*" class="d-none" @change="onFileChange" />
              <template v-if="imagePreview">
                <div class="photo-preview-wrap">
                  <img :src="imagePreview" class="photo-preview" />
                  <v-btn icon="mdi-close-circle" size="x-small" variant="flat" color="error" class="photo-clear-btn" @click.stop="clearImage" />
                </div>
                <div v-if="imageFileInfo" class="photo-file-info">
                  <span class="photo-file-name">{{ imageFileInfo.name }}</span>
                  <span class="photo-file-size">{{ imageFileInfo.size }}</span>
                </div>
              </template>
              <template v-else>
                <v-icon icon="mdi-camera-outline" size="36" color="#94a3b8" />
                <span class="upload-hint">이미지 업로드</span>
              </template>
            </div>
          </v-col>

        </v-row>
      </v-sheet>

      <!-- ══════════════ 재무 정보 ══════════════ -->
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>재무 정보</span>
          </div>
        </div>

        <!-- Row 1: 총사업비 + 연 매출액 + IRR -->
        <v-row no-gutters class="ga-6 mb-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">총사업비</span>
              <BrNumberField v-model="form.projectCost" variant="outlined" density="compact" hide-details>
                <template #append-inner><span class="form-unit">억원</span></template>
              </BrNumberField>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">연 매출액</span>
              <BrNumberField v-model="form.sales" variant="outlined" density="compact" hide-details>
                <template #append-inner><span class="form-unit">억원</span></template>
              </BrNumberField>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">IRR</span>
              <BrNumberField v-model="form.irr" :allow-decimal="true" variant="outlined" density="compact" hide-details>
                <template #append-inner><span class="form-unit">%</span></template>
              </BrNumberField>
            </div>
          </v-col>
          <v-col style="visibility: hidden;" aria-hidden="true"/>
        </v-row>

        <!-- Row 2: NPV + 투자수익 + O&M + 기술료등 -->
        <v-row no-gutters class="ga-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">NPV</span>
              <BrNumberField v-model="form.npv" :allow-decimal="true" variant="outlined" density="compact" hide-details>
                <template #append-inner><span class="form-unit">%</span></template>
              </BrNumberField>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">투자수익</span>
              <BrNumberField v-model="form.investments" :allow-decimal="true" variant="outlined" density="compact" hide-details>
                <template #append-inner><span class="form-unit">%</span></template>
              </BrNumberField>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">O&amp;M</span>
              <BrNumberField v-model="form.om" :allow-decimal="true" variant="outlined" density="compact" hide-details>
                <template #append-inner><span class="form-unit">%</span></template>
              </BrNumberField>
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">기술료등</span>
              <BrNumberField v-model="form.engineeringFee" :allow-decimal="true" variant="outlined" density="compact" hide-details>
                <template #append-inner><span class="form-unit">%</span></template>
              </BrNumberField>
            </div>
          </v-col>
        </v-row>
      </v-sheet>

      <!-- ══════════════ 분류정보 ══════════════ -->
      <v-sheet rounded="lg" class="pa-4 mb-3 form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>분류정보</span>
          </div>
        </div>
        <v-row no-gutters class="ga-6">
          <v-col>
            <div class="field-item">
              <span class="field-label">계열회사구분</span>
              <v-select
                v-model="form.cdAffiliate"
                :items="codes['151'] || []"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">회계구분</span>
              <v-select
                v-model="form.cdAccunting"
                :items="codes['150'] || []"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">인력수주용역</span>
              <v-select
                v-model="form.laborService"
                :items="[{ codeName: '해당', codeValue: 'Y' }, { codeName: '미해당', codeValue: 'N' }]"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                density="compact"
                hide-details
              />
            </div>
          </v-col>
          <v-col>
            <div class="field-item">
              <span class="field-label">연결정보</span>
              <v-select
                v-model="form.connectionInfo"
                :items="codes['152'] || []"
                item-title="codeName"
                item-value="codeValue"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </div>
          </v-col>
        </v-row>
      </v-sheet>

      <!-- ══════════════ 담당자 ══════════════ -->
      <v-sheet rounded="lg" class="pa-3 mb-3 overflow-hidden form-card">
        <div class="form-section-header mb-2">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>담당자</span>
          </div>
          <v-btn variant="flat" size="small" prepend-icon="mdi-plus" text="추가" @click="addMember" />
        </div>
        <div v-if="form.members.length === 0" class="text-center text-grey pa-3 text-caption">담당자를 추가해주세요</div>
        <div v-else class="member-card-grid">
          <div v-for="(member, idx) in form.members" :key="idx" class="member-input-card d-flex align-center ga-2">
            <span class="contrib-field-label-first">담당자</span>
            <EmpSearchField
              v-model="member.empno"
              :display-name="member.empName"
              variant="outlined"
              density="compact"
              placeholder="이름 검색"
              class="flex-grow-1"
              @select="(emp) => { member.empno = emp.empno; member.empName = emp.empName; }"
            />
            <div class="contrib-delete-divider" />
            <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="removeMember(idx)" />
          </div>
        </div>
      </v-sheet>

      <!-- ══════════════ 출자현황 ══════════════ -->
      <v-sheet rounded="lg" class="pa-3 mb-3 overflow-hidden form-card">
        <div class="form-section-header mb-3">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>출자현황</span>
          </div>
        </div>
        <v-row no-gutters class="ga-3">

          <!-- 출자금 컬럼 -->
          <v-col>
            <div class="d-flex align-center ga-2 mb-2">
              <div class="contrib-col-header contrib-col-header--equity">출자금</div>
              <v-btn
                v-for="code in equityGubunItems"
                :key="code.codeValue"
                variant="flat"
                size="small"
                prepend-icon="mdi-plus"
                :text="`${code.codeName} 추가`"
                @click="addContribution(code.codeValue)"
              />
            </div>
            <div v-if="equityContribs.length === 0" class="contrib-col-empty mb-2">등록된 항목이 없습니다</div>
            <v-row v-else dense class="mb-2">
              <v-col v-for="item in equityContribs" :key="item.idx" cols="6">
                <div class="contrib-input-card d-flex align-center ga-2">
                  <div class="flex-grow-1 d-flex flex-column ga-1">
                    <div class="d-flex align-center ga-2">
                      <v-text-field v-model="item.row.corporation" variant="outlined" density="compact" hide-details>
                        <template #prepend-inner><span class="form-unit">회사명</span></template>
                      </v-text-field>
                    </div>
                    <div class="d-flex ga-2">
                      <div class="d-flex align-center ga-2 flex-grow-1">
                        <BrNumberField v-model="item.row.rate" :allow-decimal="true" :readonly="!!form.projectCost" :bg-color="form.projectCost ? '#f5f5f5' : undefined" variant="outlined" density="compact" hide-details>
                          <template #prepend-inner><span class="form-unit">비율</span></template>
                          <template #append-inner><span class="contrib-input-unit">%</span></template>
                        </BrNumberField>
                      </div>
                      <div class="d-flex align-center ga-2 flex-grow-1">
                        <BrNumberField v-model="item.row.investmentEquity" variant="outlined" density="compact" hide-details @update:model-value="onInvestmentEquityInput(item.row)">
                          <template #prepend-inner><span class="form-unit">출자금</span></template>
                          <template #append-inner><span class="contrib-input-unit">억</span></template>
                        </BrNumberField>
                      </div>
                    </div>
                  </div>
                  <template v-if="item.row.deletable !== false">
                    <div class="contrib-delete-divider" />
                    <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="removeContribution(item.idx)" />
                  </template>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <!-- P/F 컬럼 -->
          <v-col>
            <div class="d-flex align-center ga-2 mb-2">
              <div class="contrib-col-header contrib-col-header--pf">P/F</div>
              <v-btn variant="flat" size="small" prepend-icon="mdi-plus" text="P/F 추가" color="teal" @click="addContribution(PF_GUBUN)" />
            </div>
            <div v-if="pfContribs.length === 0" class="contrib-col-empty mb-2">등록된 항목이 없습니다</div>
            <v-row v-else dense class="mb-2">
              <v-col v-for="item in pfContribs" :key="item.idx" cols="6">
                <div class="contrib-input-card contrib-input-card--pf d-flex align-center ga-2">
                  <div class="flex-grow-1 d-flex flex-column ga-1">
                    <div class="d-flex align-center ga-2">
                      <v-text-field v-model="item.row.corporation" variant="outlined" density="compact" hide-details>
                        <template #prepend-inner><span class="form-unit">대주단</span></template>
                      </v-text-field>
                    </div>
                    <div class="d-flex align-center ga-2">
                      <BrNumberField v-model="item.row.investmentEquity" variant="outlined" density="compact" hide-details @update:model-value="onInvestmentEquityInput(item.row)">
                        <template #prepend-inner><span class="form-unit">출자금</span></template>
                        <template #append-inner><span class="contrib-input-unit">억</span></template>
                      </BrNumberField>
                    </div>
                  </div>
                  <template v-if="item.row.deletable !== false">
                    <div class="contrib-delete-divider" />
                    <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="removeContribution(item.idx)" />
                  </template>
                </div>
              </v-col>
            </v-row>
            </v-col>

        </v-row>
      </v-sheet>

      <!-- ══════════════ 추진경과 ══════════════ -->
      <v-sheet rounded="lg" class="pa-3 mb-3 overflow-hidden form-card">
        <div class="form-section-header mb-2">
          <div class="d-flex align-center" style="gap: 8px;">
            <div class="section-bar" />
            <span>추진경과</span>
          </div>
          <v-btn variant="flat" size="small" prepend-icon="mdi-plus" text="추가" @click="addProgress" />
        </div>
        <div v-if="form.progressList.length === 0" class="text-center text-grey pa-3 text-caption">추진경과를 추가해주세요</div>
        <div v-else class="progress-card-grid">
          <div v-for="(row, idx) in form.progressList" :key="idx" class="progress-input-card d-flex align-center ga-2">
            <v-text-field v-model="row.progressDate" variant="outlined" density="compact" hide-details maxlength="8" style="flex: 0 0 140px;" @input="onProgressDateInput(row, $event)">
              <template #prepend-inner><span class="form-unit">일자</span></template>
            </v-text-field>
            <div class="contrib-delete-divider" />
            <v-text-field v-model="row.description" variant="outlined" density="compact" hide-details class="flex-grow-1">
              <template #prepend-inner><span class="form-unit">내역</span></template>
            </v-text-field>
            <div class="contrib-delete-divider" />
            <v-text-field v-model="row.orders" variant="outlined" density="compact" hide-details style="flex: 0 0 80px;">
              <template #prepend-inner><span class="form-unit">순서</span></template>
            </v-text-field>
            <div class="contrib-delete-divider" />
            <v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error" @click="removeProgress(idx)" />
          </div>
        </div>
      </v-sheet>

      <!-- 하단 버튼 -->
      <div class="d-flex justify-end ga-1">
        <v-btn variant="flat" text="취소" @click="onCancel" />
        <v-btn variant="flat" text="저장" @click="onSave" />
      </div>

    </v-card>
  </v-container>
</template>

<script setup>
// ============================================================
// [1] Vue / 플러그인 임포트
// ============================================================
import { ref, computed, onMounted, nextTick, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { useSelectMenuStore } from "@/store/selectMenuStore.js";
import { useCommonCode } from '@/composables/useCommonCode';
import BrNumberField from "@/components/BrNumberField.jsx";
import BrDateField from "@/components/BrDateField.jsx";
import EmpSearchField from "@/components/EmpSearchField.vue";

// ============================================================
// [2] Props / 스토어 / 글로벌 도구
// ============================================================
const props = defineProps({
  nbmId: { type: String, default: null }, // 수정 모드 시 사업번호, null이면 신규 등록
});

const router = useRouter();
const { proxy } = getCurrentInstance(); // $br_trans 등 글로벌 메서드 접근용
const selectMenuStore = useSelectMenuStore();
const { loadCodes: fetchCommonCodes } = useCommonCode();

// ============================================================
// [3] 파생 상태
// ============================================================
const isEdit   = computed(() => !!props.nbmId);                            // nbmId 존재 여부로 신규/수정 구분
const menuCode = computed(() => selectMenuStore.selectMenuInfo?.menuCode); // 저장 시 서버에 전달할 메뉴코드

// ============================================================
// [4] 공통 코드 / EIS 사업코드
// ============================================================
const codes          = ref({});  // getCodeList API 응답 맵 (key: groupCode 문자열, value: 코드 배열)
const eisCompanyItems = ref([]); // EIS SPC 법인코드 — 추후 API 연동 예정 ({ label, value } 형태)

// ============================================================
// [5] 폼 데이터
// ============================================================
// construtionPeriod / businessPeriod: DB에는 "YYYY.MM ~ YYYY.MM" 단일 문자열로 저장
// → 로드 시 split(" ~ ")으로 From/To 분리, 저장 시 다시 join(" ~ ")으로 합침
const form = ref({
  bizTitle:              "",
  eisCompanyCode:        "",
  bizContent:            "",
  capacity:              "",
  location:              "",
  continentCode:         "",
  nationCode:            "",
  projectCost:           null,
  sales:                 null,
  npv:                   null,
  irr:                   "",
  investments:           null,
  om:                    null,
  engineeringFee:        "",
  cdAffiliate:           "",
  cdAccunting:           "",
  laborService:          "",
  connectionInfo:        "",
  foundationDate:        "",
  completionDate:        "",
  construtionPeriodFrom: "",
  construtionPeriodTo:   "",
  businessPeriodFrom:    "",
  businessPeriodTo:      "",
  members:               [], // NBM_BIZ_MEMBER — empno 별도 행으로 저장
  contributions:         [{ gubun: '', corporation: '남동발전', rate: null, investmentEquity: null, deletable: false }], // NBM_CONTRIBUTIONS — 출자현황 행 목록
  progressList:          [], // NBM_PROPULSION_PROGRESS — 추진경과 행 목록
});

// ============================================================
// [6] 사진 업로드
// ============================================================
// 업로드 존: 클릭 또는 드래그&드롭으로 이미지 파일 선택
// imageFile: 실제 File 객체 — 저장 시 multipart 전송용 (현재 미사용, API 연동 시 활용)
// imagePreview: ObjectURL — 미리보기 img src에 바인딩
const fileInputRef  = ref(null);  // <input type="file"> DOM ref
const imagePreview  = ref(null);  // 미리보기 ObjectURL
const imageFileInfo = ref(null);  // { name, size } — 파일명/크기 표시용
const imageFile     = ref(null);  // 실제 File 객체 (저장 API 연동 시 사용)
const isDragOver    = ref(false); // 드래그 오버 상태 (업로드 존 스타일 전환용)

const triggerFileInput = () => fileInputRef.value?.click();

const formatFileSize = (bytes) => {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const handleFile = (file) => {
  if (!file || !file.type.startsWith("image/")) return;
  imageFile.value     = file;
  imagePreview.value  = URL.createObjectURL(file);
  imageFileInfo.value = { name: file.name, size: formatFileSize(file.size) };
};

const onFileChange = (e) => handleFile(e.target.files[0]);
const onDrop = (e) => {
  isDragOver.value = false;
  handleFile(e.dataTransfer.files[0]);
};
const clearImage = () => {
  imagePreview.value  = null;
  imageFile.value     = null;
  imageFileInfo.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
};

// ============================================================
// [7] 동적 행 추가 / 삭제 (담당자 · 출자현황 · 추진경과)
// ============================================================
const addMember       = () => form.value.members.push({ empno: "", empName: "" });
const removeMember    = (i) => form.value.members.splice(i, 1);

const PF_GUBUN   = '02';
const KOEN_CORP  = '남동발전';

const addContribution = (gubun = '') => {
  form.value.contributions.push({ gubun, corporation: "", rate: null, investmentEquity: null });
};
const removeContribution = (i) => form.value.contributions.splice(i, 1);

const equityContribs = computed(() =>
  form.value.contributions.map((row, idx) => ({ row, idx })).filter(({ row }) => row.gubun !== PF_GUBUN)
);
const pfContribs = computed(() =>
  form.value.contributions.map((row, idx) => ({ row, idx })).filter(({ row }) => row.gubun === PF_GUBUN)
);
const equityGubunItems = computed(() =>
  contribGubunItems.value.filter(item => item.codeValue !== PF_GUBUN)
);

const onInvestmentEquityInput = (row) => {
  const base = Number(form.value.projectCost) || 0;
  if (!base) return;

  // PF 출자금 합계 및 출자금 기준 (총 사업비 - PF)
  const pfTotal = form.value.contributions
    .filter(c => c.gubun === PF_GUBUN && c !== row)
    .reduce((sum, c) => sum + (Number(c.investmentEquity) || 0), 0);
  const equityBase = row.gubun === PF_GUBUN ? base : Math.max(0, base - pfTotal);

  const otherTotal = form.value.contributions
    .filter(c => c !== row)
    .reduce((sum, c) => sum + (Number(c.investmentEquity) || 0), 0);
  const maxAllowed = base - otherTotal;

  if ((Number(row.investmentEquity) || 0) > maxAllowed) {
    row.investmentEquity = maxAllowed > 0 ? maxAllowed : 0;
    proxy.$dialog.error({
      title: '출자금 초과',
      text: `출자금 총액(${equityBase.toLocaleString()}억)을 초과할 수 없습니다.<br><br>최대 입력 가능 금액: ${maxAllowed.toLocaleString()}억`,
    });
  }

  // PF는 비율 계산 제외
  if (row.gubun === PF_GUBUN) {
    row.rate = null;
    return;
  }

  const equity = Number(row.investmentEquity) || 0;
  row.rate = equity > 0 && equityBase > 0 ? parseFloat((equity / equityBase * 100).toFixed(2)) : null;
};

const addProgress = () => {
  const nextOrder = form.value.progressList.length + 1;
  form.value.progressList.push({ orders: nextOrder, progressDate: "", description: "" });
};
const removeProgress = (i) => form.value.progressList.splice(i, 1);

// ============================================================
// [8] 날짜 피커 (설립일자 / 준공일자)
// ============================================================
// BrDateField(텍스트 직접 입력) + v-date-picker(달력 팝업) 연동 패턴 — BizList.vue와 동일
// parseDate : "YYYY-MM-DD" 문자열 → Date 객체 (v-date-picker가 Date 타입 요구)
// formatDate: Date 객체 → "YYYY-MM-DD" 문자열
const foundationDateMenu = ref(false);
const completionDateMenu = ref(false);

const parseDate  = (str) => str && str.length === 10 ? new Date(str + "T00:00:00") : null;
const formatDate = (val) => {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const foundationDatePicker = computed({ get: () => parseDate(form.value.foundationDate), set: () => {} });
const completionDatePicker = computed({ get: () => parseDate(form.value.completionDate), set: () => {} });

const onFoundationDateSelected = (val) => { if (val) form.value.foundationDate = formatDate(val); foundationDateMenu.value = false; };
const onCompletionDateSelected = (val) => { if (val) form.value.completionDate = formatDate(val); completionDateMenu.value = false; };

// ============================================================
// [9] 기간 입력 포맷터 (공사기간 · 사업기간 · 추진경과 일자)
// ============================================================
// 숫자만 입력받아 자동 포맷, 6자리 완성 시 다음 필드로 포커스 이동
// fmtYYYYMM : 6자리 → "YYYY.MM"  (공사기간/사업기간)
// fmtYYMMDD : 6자리 → "YY.MM.DD" (사업기간 To, 추진경과 일자)
const construtionPeriodToRef = ref(null);
const businessPeriodToRef    = ref(null);

const fmtYYYYMM = (d) => `${d.slice(0, 4)}.${d.slice(4, 6)}`;
const fmtYYMMDD = (d) => `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 6)}`;

// form.value 최상위 필드용 — 6자리 완성 시 nextRef 포커스 이동
const onPeriodInput = (field, e, nextRef, fmt = fmtYYYYMM) => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
  form.value[field]  = digits.length === 6 ? fmt(digits) : digits;
  e.target.value = form.value[field];
  if (digits.length === 6 && nextRef?.value)
    nextTick(() => nextRef.value.$el?.querySelector("input")?.focus());
};

// 추진경과 row 직접 바인딩 — onPeriodInput은 form 최상위 필드만 지원하므로 별도 핸들러
const onProgressDateInput = (row, e) => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
  row.progressDate   = digits.length === 6 ? fmtYYMMDD(digits) : digits;
  e.target.value = row.progressDate;
};

// ============================================================
// [10] 국가분류 (국내 / 해외)
// ============================================================
// countrySection: 토글 선택값 ("1" 국내 / "2" 해외)
// - 국내 선택 → nationCode를 "대한민국"으로 고정
// - 해외 선택 → nationCode / continentCode 초기화 후 사용자 직접 선택
// - isOverseas: 대상국가 v-autocomplete 활성화 조건
const countrySectionItem = [
  { label: "국내사업", value: "1" },
  { label: "해외사업", value: "2" },
];

const allNations        = computed(() => codes.value["107"] || []); // 국가 코드 목록 (공통코드 107)
const contribGubunItems = computed(() => codes.value["153"] || []); // 출자현황 구분 코드 (공통코드 153)

// nationCode/continentCode 유무로 현재 선택 구분 파악 (수정 모드 로드 대응)
const overseasSelected = ref(false);
const countrySection = computed({
  get: () => {
    if (form.value.nationCode === "KR")                          return "1";
    if (form.value.nationCode || form.value.continentCode)       return "2";
    return overseasSelected.value ? "2" : null;
  },
  set: (val) => { overseasSelected.value = val === "2"; },
});

const isOverseas = computed(() => countrySection.value === "2");

// 국내 선택 시 대한민국 코드 자동 세팅, 해외 선택 시 초기화
const onBizSectionChange = (newVal) => {
  if (newVal !== "2") {
    const koreaItem = allNations.value.find((n) => n.codeName === "대한민국");
    form.value.nationCode    = koreaItem?.codeValue || null;
    form.value.continentCode = koreaItem?.upCode    || null;
  } else {
    form.value.nationCode    = null;
    form.value.continentCode = null;
  }
};

// 국가 선택 시 상위 대륙 코드 자동 세팅 (코드 107의 upCode 활용)
const onNationChange = (nationCode) => {
  const nation = allNations.value.find((n) => n.codeValue === nationCode);
  form.value.continentCode = nation?.upCode || null;
};

// ============================================================
// [11] API — 공통 코드 조회
// ============================================================
const loadCodes = () => {
  fetchCommonCodes(["107", "150", "151", "152", "153"]).then(groupCodes => {
    codes.value = groupCodes;
  });
};

// ============================================================
// [12] API — 상세 데이터 로드 (수정 모드)
// ============================================================
// construtionPeriod / businessPeriod: "YYYY.MM ~ YYYY.MM" → split(" ~ ")으로 From/To 분리
const loadDetail = (masterNo) => {
  proxy.$br_trans([{
    url: "/kopms-api/nbm/getNbmDetail",
    method: "post",
    data: { masterNo },
    isWait: true,
  }], (url, code, msg, data) => {
    if (code < 0) return;
    const m = data.bizMaster ?? {};
    form.value = {
      bizTitle:              m.bizTitle        ?? "",
      eisCompanyCode:        m.eisCompanyCode  ?? "",
      bizContent:            m.bizContent      ?? "",
      capacity:              m.capacity        ?? "",
      location:              m.location        ?? "",
      continentCode:         m.continentCode   ?? "",
      nationCode:            m.nationCode      ?? "",
      projectCost:           m.projectCost     ?? null,
      sales:                 m.sales           ?? null,
      npv:                   m.npv             ?? null,
      irr:                   m.irr             ?? "",
      investments:           m.investments     ?? null,
      om:                    m.om              ?? null,
      engineeringFee:        m.engineeringFee  ?? "",
      cdAffiliate:           m.cdAffiliate     ?? "",
      cdAccunting:           m.cdAccunting     ?? "",
      laborService:          m.laborService    ?? "N",
      connectionInfo:        m.connectionInfo  ?? "",
      foundationDate:        m.foundationDate  ?? "",
      completionDate:        m.completionDate  ?? "",
      construtionPeriodFrom: (m.construtionPeriod ?? "").split(" ~ ")[0] ?? "",
      construtionPeriodTo:   (m.construtionPeriod ?? "").split(" ~ ")[1] ?? "",
      businessPeriodFrom:    (m.businessPeriod    ?? "").split(" ~ ")[0] ?? "",
      businessPeriodTo:      (m.businessPeriod    ?? "").split(" ~ ")[1] ?? "",
      members:       (data.members       ?? []).map((x) => ({ empno: x.empno, empName: x.empName })),
      contributions: (data.contributions ?? []).map((x) => ({ ...x, deletable: x.corporation !== KOEN_CORP ? true : false })),
      progressList:  (data.progressList  ?? []).map((x) => ({ ...x })),
    };
  });
};

// ============================================================
// [13] 저장 / 취소
// ============================================================
// construtionPeriod / businessPeriod: From/To를 " ~ "로 join해서 단일 문자열로 전송
const onSave = () => {
  if (!form.value.bizTitle) {
    proxy.$dialog.error({ title: '필수항목 누락', text: '사업명을 입력해주세요.' });
    return;
  }
  if (isOverseas.value && !form.value.nationCode) {
    proxy.$dialog.error({ title: '필수항목 누락', text: '국가분류를 선택해주세요.' });
    return;
  }
  proxy.$br_trans([{
    url: "/kopms-api/nbm/saveNbm",
    method: "post",
    data: {
      masterNo: props.nbmId ?? null,
      menuCode: menuCode.value,
      ...form.value,
      construtionPeriod: [form.value.construtionPeriodFrom, form.value.construtionPeriodTo].filter(Boolean).join(" ~ "),
      businessPeriod:    [form.value.businessPeriodFrom,    form.value.businessPeriodTo   ].filter(Boolean).join(" ~ "),
    },
    isWait: true,
  }], (url, code, msg, data) => {
    if (code < 0) return;
    router.push(`/operation/${props.nbmId ?? data.masterNo}`);
  });
};

// 취소: 수정 모드면 상세 조회로, 신규 모드면 목록으로 이동
const onCancel = () => {
  if (isEdit.value) router.push(`/operation/${props.nbmId}`);
  else              router.push("/bo/operation");
};

// ============================================================
// [14] 생명주기
// ============================================================
onMounted(() => {
  const label = isEdit.value ? '사업개요 수정' : '사업개요 등록';
  selectMenuStore.setMenuName(label);
  selectMenuStore.setMenuPath(`사업운영 > 운영현황 > ${label}`);
  loadCodes();
  if (isEdit.value) loadDetail(props.nbmId); // 수정 모드일 때만 상세 로드
});
</script>

<style scoped lang="scss">

.nation-divider {
  color: #cbd5e1;
  font-size: 1rem;
  line-height: 1;
  margin: 0 6px;
  user-select: none;
}

/* ── 사업명 제목형 ──────────────────────────────────── */
.biz-title-wrap {
  padding: 0 2px;
}

:deep(.biz-title-input .v-field__input) {
  font-size: 1.45rem;
  font-weight: 700;
  color: #0f172a;
  padding-bottom: 6px;
}

/* ── 이미지 업로드 ───────────────────────────────────── */
.photo-upload-zone {
  width: 100%;
  min-height: 160px;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  background: #f8fafc;
  transition: border-color 0.18s, background 0.18s;

  &:hover,
  &.photo-upload-zone--dragover {
    border-color: #2563eb;
    background: #eff6ff;
  }
}

.photo-preview-wrap {
  position: relative;
  width: 70%;
}

.photo-preview {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.photo-file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px 0;
  width: 100%;
}

.photo-file-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.photo-file-size {
  font-size: 0.7rem;
  color: #9e9e9e;
}

.upload-hint {
  font-size: 0.72rem;
  color: #94a3b8;
  text-align: center;
  line-height: 1.3;
}

.photo-clear-btn {
  position: absolute !important;
  top: -8px !important;
  right: -8px !important;
}

/* ── 담당자 / 출자현황 / 추진경과 카드 ─────────────────── */
.contrib-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.progress-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.progress-input-card {
  background: #f4f6fb;
  border: 1px solid #dde3f0;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.member-card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.member-input-card {
  background: #f4f6fb;
  border: 1px solid #dde3f0;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.contrib-col-header {
  display: inline-flex;
  align-items: center;
  height: 28px;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0 10px;
  border-radius: 6px;

  &--equity {
    color: #1D4ED8;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
  }

  &--pf {
    color: #0F766E;
    background: #f0fdf9;
    border: 1px solid #99f6e4;
  }
}

.contrib-col-empty {
  padding: 12px;
  text-align: center;
  color: #bdbdbd;
  font-size: 0.8rem;
  border-radius: 8px;
  background: #fafafa;
  border: 1px dashed #e2e8f0;
}

.contrib-input-card {
  background: #f4f6fb;
  border: 1px solid #dde3f0;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &--pf {
    background: #f0fdf9;
    border-color: #99f6e4;
  }
}

.contrib-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}

.contrib-input-unit {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}

.contrib-field-label {
  display: flex;
  flex: 0 0 40px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  flex-shrink: 0;
  justify-content: end;
}

.contrib-field-label-first {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.contrib-delete-divider {
  width: 1px;
  align-self: stretch;
  background: #e2e8f0;
  flex-shrink: 0;
  margin-left: 10px;
}
</style>
