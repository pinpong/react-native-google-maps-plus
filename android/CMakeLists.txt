project(RNGoogleMapsPlus)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME RNGoogleMapsPlus)
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Enable Raw Props parsing in react-native (for Nitro Views)
add_compile_options(-DRN_SERIALIZABLE_STATE=1)

# SVG renderer (lunasvg + bundled plutovg), git submodule at cpp/third_party/lunasvg
set(LUNASVG_DIR ${CMAKE_SOURCE_DIR}/../cpp/third_party/lunasvg)
if(NOT EXISTS ${LUNASVG_DIR}/include/lunasvg.h)
    message(FATAL_ERROR "[RNGoogleMapsPlus] lunasvg sources are missing. In a git checkout run `git submodule update --init`, otherwise install the package from npm.")
endif()
file(GLOB LUNASVG_SOURCES
        ${LUNASVG_DIR}/source/*.cpp
        ${LUNASVG_DIR}/plutovg/source/*.c
)
list(FILTER LUNASVG_SOURCES EXCLUDE REGEX "plutovg-font\\.c$")
add_library(rngmp_svg STATIC
        ${LUNASVG_SOURCES}
        ../cpp/svg/RNSvgPlutovgFont.c
        ../cpp/svg/RNSvgRasterizer.cpp
)
target_include_directories(rngmp_svg
        PRIVATE ${LUNASVG_DIR}/source ${LUNASVG_DIR}/include ${LUNASVG_DIR}/plutovg/include
        PUBLIC ../cpp/svg
)
target_compile_definitions(rngmp_svg PRIVATE
        LUNASVG_BUILD
        LUNASVG_BUILD_STATIC
        PLUTOVG_BUILD
        PLUTOVG_BUILD_STATIC
        LUNASVG_DISABLE_EXTERNAL_RESOURCES
)
target_compile_options(rngmp_svg PRIVATE -fvisibility=hidden $<$<CONFIG:Debug>:-O2>)
set_target_properties(rngmp_svg PROPERTIES POSITION_INDEPENDENT_CODE ON C_STANDARD 11)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
        src/main/cpp/cpp-adapter.cpp
        src/main/cpp/SvgJni.cpp
)

# Compile options, only JNI_OnLoad has to be exported, hide every other symbol
target_compile_options(${PACKAGE_NAME} PRIVATE
        -frtti
        -fexceptions
        -Wall
        -fstack-protector-all
        -fvisibility=hidden
        $<$<CONFIG:Debug>:-O1>
)

# Add Nitrogen specs :)
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/RNGoogleMapsPlus+autolinking.cmake)

# Set up local includes
include_directories(
        "src/main/cpp"
        "../cpp"
)

find_library(LOG_LIB log)
find_library(JNIGRAPHICS_LIB jnigraphics)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        ${JNIGRAPHICS_LIB}
        rngmp_svg
        android                                   # <-- Android core
)
