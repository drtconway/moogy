cmake_minimum_required(VERSION 3.1)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

project(moogy-reference VERSION 1.0)

FUNCTION(PREPEND var )
   SET(listVar "")
   FOREACH(f ${${var}})
       LIST(APPEND listVar "${CMAKE_CURRENT_SOURCE_DIR}/${f}")
   ENDFOREACH(f)
   SET(${var} "${listVar}" PARENT_SCOPE)
ENDFUNCTION(PREPEND)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/bin")
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/lib")

#set(CMAKE_BUILD_TYPE Debug)
set(CMAKE_BUILD_TYPE RelWithDebInfo)

find_package(Boost REQUIRED)
find_package(docopt COMPONENTS CXX REQUIRED)
find_package(nlohmann_json 3.2.0 REQUIRED)

add_subdirectory(src)

include_directories(${DOCOPT_INCLUDE_DIRS})
include_directories(include)

add_executable(moogy-reference ${MOOGY_REFERENCE_SRC})

target_link_libraries(
    moogy-reference
    docopt
    ${Boost_LIBRARIES}
    nlohmann_json::nlohmann_json)
